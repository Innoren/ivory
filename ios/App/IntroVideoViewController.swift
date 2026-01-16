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
        // Use resizeAspect to show full video without zoom/crop
        playerViewController?.videoGravity = .resizeAspect
        
        if let playerVC = playerViewController {
            addChild(playerVC)
            view.addSubview(playerVC.view)
            playerVC.view.frame = view.bounds
            playerVC.didMove(toParent: self)
        }
        
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
    
    @objc private func videoDidEnd() {
        print("🎬 Video ended")
        onComplete?()
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}
