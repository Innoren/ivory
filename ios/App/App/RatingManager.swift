//
//  RatingManager.swift
//  Ivory's Choice
//
//  Manages App Store rating requests
//

import Foundation
import StoreKit

class RatingManager {
    static let shared = RatingManager()
    
    private init() {}
    
    func requestReview(data: [String: Any], viewModel: WebViewModel?) {
        guard let callbackId = data["callbackId"] else {
            print("❌ RatingManager: Missing callbackId")
            return
        }
        
        DispatchQueue.main.async {
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
                SKStoreReviewController.requestReview(in: windowScene)
                print("✅ App Store rating prompt requested")
                viewModel?.resolveCallback(callbackId: callbackId, result: ["success": true])
            } else {
                print("❌ Unable to get window scene for rating")
                viewModel?.resolveCallback(callbackId: callbackId, result: ["success": false])
            }
        }
    }
}
