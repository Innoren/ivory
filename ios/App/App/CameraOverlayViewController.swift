//
//  CameraOverlayViewController.swift
//  Ivory's Choice
//
//  Custom camera view controller with reference image overlay
//

import UIKit
import AVFoundation
import os.log

class CameraOverlayViewController: UIViewController {
    
    // MARK: - Properties
    
    private let logger = OSLog(subsystem: "com.ivory.app", category: "CameraOverlay")
    private var captureSession: AVCaptureSession?
    private var previewLayer: AVCaptureVideoPreviewLayer?
    private var photoOutput: AVCapturePhotoOutput?
    private var overlayImageView: UIImageView?
    
    var onImageCaptured: ((UIImage) -> Void)?
    var onCancel: (() -> Void)?
    var overlayImageName: String = "ref2" // Default overlay image
    var overlayOpacity: CGFloat = 0.5 // Default opacity
    
    // MARK: - UI Elements
    
    private lazy var captureButton: UIButton = {
        let button = UIButton(type: .system)
        button.backgroundColor = .white
        button.layer.cornerRadius = 35
        button.layer.borderWidth = 5
        button.layer.borderColor = UIColor.white.withAlphaComponent(0.5).cgColor
        button.translatesAutoresizingMaskIntoConstraints = false
        button.addTarget(self, action: #selector(capturePhoto), for: .touchUpInside)
        return button
    }()
    
    private lazy var closeButton: UIButton = {
        let button = UIButton(type: .system)
        button.setImage(UIImage(systemName: "xmark"), for: .normal)
        button.tintColor = .white
        button.backgroundColor = UIColor.black.withAlphaComponent(0.5)
        button.layer.cornerRadius = 20
        button.translatesAutoresizingMaskIntoConstraints = false
        button.addTarget(self, action: #selector(closeCamera), for: .touchUpInside)
        return button
    }()
    
    private lazy var flipButton: UIButton = {
        let button = UIButton(type: .system)
        button.setImage(UIImage(systemName: "camera.rotate"), for: .normal)
        button.tintColor = .white
        button.backgroundColor = UIColor.black.withAlphaComponent(0.5)
        button.layer.cornerRadius = 20
        button.translatesAutoresizingMaskIntoConstraints = false
        button.addTarget(self, action: #selector(flipCamera), for: .touchUpInside)
        return button
    }()
    
    private lazy var opacitySlider: UISlider = {
        let slider = UISlider()
        slider.minimumValue = 0
        slider.maximumValue = 1
        slider.value = Float(overlayOpacity)
        slider.minimumTrackTintColor = .white
        slider.maximumTrackTintColor = .gray
        slider.translatesAutoresizingMaskIntoConstraints = false
        slider.addTarget(self, action: #selector(opacityChanged), for: .valueChanged)
        return slider
    }()
    
    private var currentCameraPosition: AVCaptureDevice.Position = .back
    
    // MARK: - Lifecycle
    
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        setupCamera()
        setupOverlay()
        setupUI()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        captureSession?.startRunning()
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        captureSession?.stopRunning()
    }
    
    // MARK: - Setup
    
    private func setupCamera() {
        captureSession = AVCaptureSession()
        captureSession?.sessionPreset = .photo
        
        guard let captureSession = captureSession else { return }
        
        // Setup camera input
        guard let camera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: currentCameraPosition),
              let input = try? AVCaptureDeviceInput(device: camera) else {
            os_log("❌ Failed to setup camera", log: logger, type: .error)
            return
        }
        
        if captureSession.canAddInput(input) {
            captureSession.addInput(input)
        }
        
        // Setup photo output
        photoOutput = AVCapturePhotoOutput()
        if let photoOutput = photoOutput, captureSession.canAddOutput(photoOutput) {
            captureSession.addOutput(photoOutput)
        }
        
        // Setup preview layer
        previewLayer = AVCaptureVideoPreviewLayer(session: captureSession)
        previewLayer?.videoGravity = .resizeAspectFill
        previewLayer?.frame = view.bounds
        
        if let previewLayer = previewLayer {
            view.layer.insertSublayer(previewLayer, at: 0)
        }
        
        os_log("✅ Camera setup complete", log: logger, type: .info)
    }
    
    private func setupOverlay() {
        // Load overlay image from bundle
        guard let overlayImage = UIImage(named: overlayImageName) else {
            os_log("⚠️ Overlay image '%@' not found", log: logger, type: .error, overlayImageName)
            return
        }
        
        overlayImageView = UIImageView(image: overlayImage)
        overlayImageView?.contentMode = .scaleAspectFit
        overlayImageView?.alpha = overlayOpacity
        overlayImageView?.translatesAutoresizingMaskIntoConstraints = false
        
        if let overlayImageView = overlayImageView {
            view.addSubview(overlayImageView)
            
            NSLayoutConstraint.activate([
                overlayImageView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
                overlayImageView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
                overlayImageView.widthAnchor.constraint(equalTo: view.widthAnchor, multiplier: 0.8),
                overlayImageView.heightAnchor.constraint(equalTo: view.heightAnchor, multiplier: 0.8)
            ])
        }
        
        os_log("✅ Overlay setup complete with opacity: %f", log: logger, type: .info, overlayOpacity)
    }
    
    private func setupUI() {
        view.addSubview(captureButton)
        view.addSubview(closeButton)
        view.addSubview(flipButton)
        view.addSubview(opacitySlider)
        
        NSLayoutConstraint.activate([
            // Capture button (bottom center)
            captureButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            captureButton.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -30),
            captureButton.widthAnchor.constraint(equalToConstant: 70),
            captureButton.heightAnchor.constraint(equalToConstant: 70),
            
            // Close button (top left)
            closeButton.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            closeButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            closeButton.widthAnchor.constraint(equalToConstant: 40),
            closeButton.heightAnchor.constraint(equalToConstant: 40),
            
            // Flip button (top right)
            flipButton.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            flipButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            flipButton.widthAnchor.constraint(equalToConstant: 40),
            flipButton.heightAnchor.constraint(equalToConstant: 40),
            
            // Opacity slider (bottom, above capture button)
            opacitySlider.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            opacitySlider.bottomAnchor.constraint(equalTo: captureButton.topAnchor, constant: -30),
            opacitySlider.widthAnchor.constraint(equalToConstant: 200)
        ])
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        previewLayer?.frame = view.bounds
    }
    
    // MARK: - Actions
    
    @objc private func capturePhoto() {
        guard let photoOutput = photoOutput else { return }
        
        let settings = AVCapturePhotoSettings()
        photoOutput.capturePhoto(with: settings, delegate: self)
        
        // Visual feedback
        UIView.animate(withDuration: 0.1, animations: {
            self.captureButton.transform = CGAffineTransform(scaleX: 0.9, y: 0.9)
        }) { _ in
            UIView.animate(withDuration: 0.1) {
                self.captureButton.transform = .identity
            }
        }
        
        os_log("📸 Capturing photo", log: logger, type: .info)
    }
    
    @objc private func closeCamera() {
        dismiss(animated: true) {
            self.onCancel?()
        }
    }
    
    @objc private func flipCamera() {
        guard let captureSession = captureSession else { return }
        
        captureSession.beginConfiguration()
        
        // Remove current input
        if let currentInput = captureSession.inputs.first as? AVCaptureDeviceInput {
            captureSession.removeInput(currentInput)
        }
        
        // Toggle camera position
        currentCameraPosition = currentCameraPosition == .back ? .front : .back
        
        // Add new input
        guard let camera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: currentCameraPosition),
              let input = try? AVCaptureDeviceInput(device: camera) else {
            captureSession.commitConfiguration()
            return
        }
        
        if captureSession.canAddInput(input) {
            captureSession.addInput(input)
        }
        
        captureSession.commitConfiguration()
        
        os_log("🔄 Camera flipped to %@", log: logger, type: .info, currentCameraPosition == .back ? "back" : "front")
    }
    
    @objc private func opacityChanged(_ slider: UISlider) {
        overlayImageView?.alpha = CGFloat(slider.value)
        os_log("🎚️ Overlay opacity changed to %f", log: logger, type: .info, slider.value)
    }
}

// MARK: - AVCapturePhotoCaptureDelegate

extension CameraOverlayViewController: AVCapturePhotoCaptureDelegate {
    func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
        if let error = error {
            os_log("❌ Photo capture error: %@", log: logger, type: .error, error.localizedDescription)
            return
        }
        
        guard let imageData = photo.fileDataRepresentation(),
              let image = UIImage(data: imageData) else {
            os_log("❌ Failed to process photo data", log: logger, type: .error)
            return
        }
        
        os_log("✅ Photo captured successfully", log: logger, type: .info)
        
        dismiss(animated: true) {
            self.onImageCaptured?(image)
        }
    }
}
