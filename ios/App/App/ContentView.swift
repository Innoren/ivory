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
    @State private var showOnboardingVideo = !OnboardingManager.shared.hasSeenOnboardingVideo
    
    init() {
        print("🎬 ContentView init called")
        print("🎬 Initial onboarding check: \(!OnboardingManager.shared.hasSeenOnboardingVideo)")
    }
    
    var body: some View {
        ZStack {
            if showOnboardingVideo {
                OnboardingVideoView {
                    withAnimation(.easeInOut(duration: 0.5)) {
                        showOnboardingVideo = false
                    }
                }
                .transition(.opacity)
            } else {
                WebView(viewModel: webViewModel)
                
                // Loading indicator
                if webViewModel.isLoading {
                    ProgressView()
                        .scaleEffect(1.5)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(Color.black.opacity(0.3))
                }
            }
            
            // Debug indicator (only in debug builds)
            #if DEBUG
            VStack {
                HStack {
                    Spacer()
                    Text(showOnboardingVideo ? "ONBOARDING" : "WEBVIEW")
                        .font(.caption)
                        .padding(4)
                        .background(Color.red.opacity(0.7))
                        .foregroundColor(.white)
                        .cornerRadius(4)
                        .padding(.top, 50)
                        .padding(.trailing, 10)
                }
                Spacer()
            }
            #endif
        }
        .onAppear {
            print("🎬 ContentView onAppear called")
            print("🎬 Current showOnboardingVideo state: \(showOnboardingVideo)")
            
            // Check onboarding status
            let hasSeenOnboarding = OnboardingManager.shared.hasSeenOnboardingVideo
            print("🎬 Onboarding check - hasSeenOnboarding: \(hasSeenOnboarding)")
            
            // Check UserDefaults directly for debugging
            let rawValue = UserDefaults.standard.object(forKey: "hasSeenOnboardingVideo")
            print("🎬 Raw UserDefaults value for hasSeenOnboardingVideo: \(String(describing: rawValue))")
            
            if !hasSeenOnboarding {
                print("🎬 First launch detected, showing onboarding video")
                DispatchQueue.main.async {
                    showOnboardingVideo = true
                    print("🎬 showOnboardingVideo set to: \(showOnboardingVideo)")
                }
            } else {
                print("🎬 User has seen onboarding, skipping video")
            }
            
            // Initialize managers
            iapManager.setWebViewModel(webViewModel)
            watchManager.setWebViewModel(webViewModel)
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
