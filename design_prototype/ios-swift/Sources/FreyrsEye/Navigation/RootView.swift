import SwiftUI

struct RootView: View {
    @EnvironmentObject var app: AppState

    var body: some View {
        if !app.onboardingDone {
            OnboardingView()
        } else {
            MainTabsView()
        }
    }
}

struct MainTabsView: View {
    @State private var tab: Tab = .dashboard
    enum Tab: Hashable { case dashboard, horda, chat, saga, settings }

    var body: some View {
        TabView(selection: $tab) {
            DashboardView()
                .tabItem { Label("Oko", systemImage: "eye") }
                .tag(Tab.dashboard)
            HordaView()
                .tabItem { Label("Sad", systemImage: "leaf") }
                .tag(Tab.horda)
            ChatView()
                .tabItem { Label("Mowa", systemImage: "bubble.left") }
                .tag(Tab.chat)
            KronikaView()
                .tabItem { Label("Saga", systemImage: "book.closed") }
                .tag(Tab.saga)
            SettingsView()
                .tabItem { Label("Ustaw.", systemImage: "slider.horizontal.3") }
                .tag(Tab.settings)
        }
        .tint(Theme.Color.gold)
    }
}
