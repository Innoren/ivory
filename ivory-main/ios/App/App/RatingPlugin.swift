import Foundation
import Capacitor
import StoreKit

@objc(RatingPlugin)
public class RatingPlugin: CAPPlugin {
    
    @objc func requestReview(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
                SKStoreReviewController.requestReview(in: windowScene)
                call.resolve()
            } else {
                call.reject("Unable to get window scene")
            }
        }
    }
}
