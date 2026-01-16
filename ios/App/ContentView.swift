//
//  ContentView.swift
//  Ivory's Choice
//
//  Native SwiftUI + WKWebView implementation
//

import SwiftUI
import WebKit
import Foundation

struct ContentView: View {
    @StateObject private var webViewModel = WebViewModel()
    @StateObject private var iapManager = IAPManager.shared
    @StateObject private var watchManager = WatchConnectivityManager.shared
    @State private var showIntroVideo = false
    
    var body: some View {
        ZStack {
            WebView(viewModel: webViewModel)
            
            // Loading indicator
            if webViewModel.isLoading {
                ProgressView()
                    .scaleEffect(1.5)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color.black.opacity(0.3))
            }
        }
        .onAppear {
            print("🔴 ========================================")
            print("🔴 ContentView.onAppear() CALLED")
            print("🔴 ========================================")
            
            // Initialize managers
            iapManager.setWebViewModel(webViewModel)
            watchManager.setWebViewModel(webViewModel)
            
            // Test 1: Check if video file exists in bundle
            print("🧪 TEST 1: Checking if video file exists in bundle...")
            if let videoPath = Bundle.main.path(forResource: "ivory2", ofType: "mp4") {
                print("✅ SUCCESS: Video file EXISTS in bundle")
                print("📍 Path: \(videoPath)")
                
                // Check file size
                if let attributes = try? FileManager.default.attributesOfItem(atPath: videoPath),
                   let fileSize = attributes[.size] as? Int64 {
                    let sizeMB = Double(fileSize) / 1_000_000.0
                    print("📦 File size: \(String(format: "%.2f", sizeMB)) MB")
                }
            } else {
                print("❌ FAILED: Video file NOT FOUND in bundle!")
                print("❌ You must add ivory3.mp4 to Xcode:")
                print("   1. Drag ivory3.mp4 into Xcode Project Navigator")
                print("   2. Check 'Copy items if needed'")
                print("   3. Check 'Add to targets: App'")
            }
            
            // Test 2: Check UserDefaults
            print("🧪 TEST 2: Checking UserDefaults...")
            let hasSeenVideo = UserDefaults.standard.bool(forKey: "hasSeenIntroVideo")
            print("📝 hasSeenIntroVideo = \(hasSeenVideo)")
            
            // Test 3: Check if IntroVideoViewController class exists
            print("🧪 TEST 3: Checking if IntroVideoViewController exists...")
            let controllerExists = NSClassFromString("IntroVideoViewController") != nil
            if controllerExists {
                print("✅ SUCCESS: IntroVideoViewController class found")
            } else {
                print("❌ FAILED: IntroVideoViewController class NOT FOUND")
                print("❌ You must add IntroVideoViewController.swift to Xcode")
            }
            
            // Decision
            print("🎬 ========================================")
            if !hasSeenVideo {
                print("🎬 DECISION: Will show intro video")
                print("🎬 Scheduling video display in 0.3 seconds...")
                // Small delay to ensure view is fully loaded
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                    print("🎬 Setting showIntroVideo = true NOW")
                    showIntroVideo = true
                }
            } else {
                print("🎬 DECISION: User has already seen video, skipping")
            }
            print("🎬 ========================================")
        }
        .fullScreenCover(isPresented: $showIntroVideo) {
            IntroVideoViewControllerRepresentable(onComplete: {
                print("🎬 Video completed callback received")
                UserDefaults.standard.set(true, forKey: "hasSeenIntroVideo")
                print("🎬 Saved hasSeenIntroVideo = true")
                showIntroVideo = false
                
                // Navigate to login/signup page after video ends
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                    print("🎬 Navigating to login page...")
                    webViewModel.navigateToLogin()
                }
            })
            .edgesIgnoringSafeArea(.all)
        }
    }
}

// SwiftUI wrapper for UIKit video controller
struct IntroVideoViewControllerRepresentable: UIViewControllerRepresentable {
    let onComplete: () -> Void
    
    func makeUIViewController(context: Context) -> IntroVideoViewController {
        print("🎬 Creating IntroVideoViewController")
        let controller = IntroVideoViewController()
        controller.onComplete = onComplete
        controller.modalPresentationStyle = .fullScreen
        return controller
    }
    
    func updateUIViewController(_ uiViewController: IntroVideoViewController, context: Context) {
        // No updates needed
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
