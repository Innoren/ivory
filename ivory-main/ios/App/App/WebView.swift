//
//  WebView.swift
//  Ivory's Choice
//
//  WKWebView wrapper with JavaScript bridge
//

import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    @ObservedObject var viewModel: WebViewModel
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        
        // Configure preferences
        configuration.preferences.javaScriptEnabled = true
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        
        // Add message handlers for JavaScript bridge
        let contentController = configuration.userContentController
        contentController.add(context.coordinator, name: "nativeHandler")
        
        // Create webview
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.scrollView.contentInsetAdjustmentBehavior = .automatic
        webView.isOpaque = false
        webView.backgroundColor = .white
        
        // Disable zoom
        webView.scrollView.maximumZoomScale = 1.0
        webView.scrollView.minimumZoomScale = 1.0
        
        // Load the web app
        viewModel.webView = webView
        viewModel.loadWebApp()
        
        return webView
    }
    
    func updateUIView(_ webView: WKWebView, context: Context) {
        // Updates handled by view model
    }
    
    class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
        var parent: WebView
        
        init(_ parent: WebView) {
            self.parent = parent
        }
        
        // MARK: - Navigation Delegate
        
        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            DispatchQueue.main.async {
                self.parent.viewModel.isLoading = true
            }
        }
        
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            DispatchQueue.main.async {
                self.parent.viewModel.isLoading = false
            }
            parent.viewModel.injectBridge()
            
            // Inject safe area information and CSS for ALL pages (including external like Stripe)
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
               let window = windowScene.windows.first {
                let safeAreaInsets = window.safeAreaInsets
                let safeAreaScript = """
                window.iosSafeArea = {
                    top: \(safeAreaInsets.top),
                    bottom: \(safeAreaInsets.bottom),
                    left: \(safeAreaInsets.left),
                    right: \(safeAreaInsets.right)
                };
                
                // Add CSS for safe area handling - applies to ALL pages including external
                const style = document.createElement('style');
                style.id = 'ios-safe-area-style';
                
                // Remove existing style if present (for page reloads)
                const existingStyle = document.getElementById('ios-safe-area-style');
                if (existingStyle) existingStyle.remove();
                
                style.textContent = `
                    :root {
                        --safe-area-inset-top: \(safeAreaInsets.top)px;
                        --safe-area-inset-bottom: \(safeAreaInsets.bottom)px;
                        --safe-area-inset-left: \(safeAreaInsets.left)px;
                        --safe-area-inset-right: \(safeAreaInsets.right)px;
                    }
                    
                    /* Add extra padding to body for external pages (like Stripe checkout) */
                    /* Using safe area + 40px extra to push content well below the notch */
                    body {
                        padding-top: \(safeAreaInsets.top + 40)px !important;
                    }
                    
                    /* Don't double-pad our own app pages that handle safe area themselves */
                    body.ios-native {
                        padding-top: 0 !important;
                    }
                `;
                document.head.appendChild(style);
                
                // Add iOS native class to body ONLY for our app pages
                const isOurApp = window.location.hostname.includes('localhost') || 
                                 window.location.hostname.includes('vercel.app') ||
                                 window.location.hostname.includes('ivory');
                if (isOurApp) {
                    document.body.classList.add('ios-native');
                }
                
                // Dispatch event to notify web app about safe areas
                window.dispatchEvent(new CustomEvent('iosSafeAreaUpdated', {
                    detail: window.iosSafeArea
                }));
                """
                webView.evaluateJavaScript(safeAreaScript)
            }
        }
        
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            DispatchQueue.main.async {
                self.parent.viewModel.isLoading = false
            }
            print("❌ WebView navigation failed: \(error.localizedDescription)")
            
            // Try to reload after a delay if it's a network error
            if (error as NSError).code == NSURLErrorCannotConnectToHost {
                print("🔄 Retrying connection to localhost in 2 seconds...")
                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                    self.parent.viewModel.loadWebApp()
                }
            }
        }
        
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            // Handle external links
            if let url = navigationAction.request.url,
               navigationAction.navigationType == .linkActivated,
               url.scheme != "http" && url.scheme != "https" {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
                return
            }
            decisionHandler(.allow)
        }
        
        // MARK: - UI Delegate
        
        func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
            let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
                completionHandler()
            })
            
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
               let rootViewController = windowScene.windows.first?.rootViewController {
                rootViewController.present(alert, animated: true)
            }
        }
        
        func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
            let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in
                completionHandler(false)
            })
            alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
                completionHandler(true)
            })
            
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
               let rootViewController = windowScene.windows.first?.rootViewController {
                rootViewController.present(alert, animated: true)
            }
        }
        
        // MARK: - Message Handler
        
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard let body = message.body as? [String: Any],
                  let action = body["action"] as? String else {
                print("❌ Invalid message format")
                return
            }
            
            print("📨 Received message from web: \(action)")
            parent.viewModel.handleMessage(action: action, data: body)
        }
    }
}
