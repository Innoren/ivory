import UIKit
import AVKit
import AVFoundation

class IntroVideoViewController: AVPlayerViewController {
    
    var onComplete: (() -> Void)?
    private var hasCompletedOnce = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Configure player view controller
        showsPlaybackControls = false
        videoGravity = .resizeAspectFill
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
        
        print("🎬 Calling onComplete callback")
        onComplete?()
    }
    
    deinit {
        print("🎬 IntroVideoViewController deallocated")
        NotificationCenter.default.removeObserver(self)
    }
}
