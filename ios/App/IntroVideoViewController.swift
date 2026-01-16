import UIKit
import AVKit
import AVFoundation
import StoreKit

class IntroVideoViewController: AVPlayerViewController {
    
    var onComplete: (() -> Void)?
    private var hasCompletedOnce = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Configure player view controller
        showsPlaybackControls = false
        // Use resizeAspect to show full video without zoom/crop
        videoGravity = .resizeAspect
        view.backgroundColor = .black
        
        // Get video from bundle
        guard let videoPath = Bundle.main.path(forResource: "ivory2", ofType: "mp4") else {
            print("❌ Video file 'ivory2.mp4' not found in bundle")
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                self.handleCompletion()
            }
            return
        }
        
        print("✅ Video file found at: \(videoPath)")
        
        let videoURL = URL(fileURLWithPath: videoPath)
        let playerItem = AVPlayerItem(url: videoURL)
        let player = AVPlayer(playerItem: playerItem)
        self.player = player
        
        // Listen for video end
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(videoDidEnd),
            name: .AVPlayerItemDidPlayToEndTime,
            object: playerItem
        )
        
        // Play video
        player.play()
        print("🎬 Native video player started playing")
    }
    
    @objc private func videoDidEnd() {
        print("🎬 Video playback ended")
        handleCompletion()
    }
    
    private func handleCompletion() {
        guard !hasCompletedOnce else {
            print("⚠️ handleCompletion called multiple times, ignoring")
            return
        }
        hasCompletedOnce = true
        
        print("🎬 Requesting App Store rating...")
        
        // Request App Store rating
        if let windowScene = view.window?.windowScene {
            SKStoreReviewController.requestReview(in: windowScene)
        }
        
        // Small delay to let rating dialog appear, then dismiss video
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            print("🎬 Calling onComplete callback")
            self.onComplete?()
        }
    }
    
    deinit {
        print("🎬 IntroVideoViewController deallocated")
        NotificationCenter.default.removeObserver(self)
    }
}
