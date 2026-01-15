import UIKit
import AVKit
import AVFoundation

class IntroVideoViewController: UIViewController {
    
    private var playerViewController: AVPlayerViewController?
    private var player: AVPlayer?
    var onComplete: (() -> Void)?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        view.backgroundColor = .black
        
        // Get video from bundle
        guard let videoPath = Bundle.main.path(forResource: "ivory2", ofType: "mp4") else {
            print("❌ Video file not found in bundle")
            onComplete?()
            return
        }
        
        let videoURL = URL(fileURLWithPath: videoPath)
        player = AVPlayer(url: videoURL)
        
        playerViewController = AVPlayerViewController()
        playerViewController?.player = player
        playerViewController?.showsPlaybackControls = false
        playerViewController?.videoGravity = .resizeAspectFill
        
        if let playerVC = playerViewController {
            addChild(playerVC)
            view.addSubview(playerVC.view)
            playerVC.view.frame = view.bounds
            playerVC.didMove(toParent: self)
        }
        
        // Add skip button
        let skipButton = UIButton(type: .system)
        skipButton.setTitle("✕", for: .normal)
        skipButton.titleLabel?.font = .systemFont(ofSize: 24, weight: .light)
        skipButton.setTitleColor(.white, for: .normal)
        skipButton.backgroundColor = UIColor.white.withAlphaComponent(0.2)
        skipButton.layer.cornerRadius = 20
        skipButton.translatesAutoresizingMaskIntoConstraints = false
        skipButton.addTarget(self, action: #selector(skipTapped), for: .touchUpInside)
        
        view.addSubview(skipButton)
        
        NSLayoutConstraint.activate([
            skipButton.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 16),
            skipButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),
            skipButton.widthAnchor.constraint(equalToConstant: 40),
            skipButton.heightAnchor.constraint(equalToConstant: 40)
        ])
        
        // Listen for video end
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(videoDidEnd),
            name: .AVPlayerItemDidPlayToEndTime,
            object: player?.currentItem
        )
        
        // Play video
        player?.play()
        print("🎬 Native video player started")
    }
    
    @objc private func skipTapped() {
        print("🎬 User skipped video")
        player?.pause()
        onComplete?()
    }
    
    @objc private func videoDidEnd() {
        print("🎬 Video ended")
        onComplete?()
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}
