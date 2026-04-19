import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var app: AppState
    @State private var step: Int = 0

    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            Text("ᚠ").font(Theme.Font.serif(100)).foregroundColor(Theme.Color.gold)
            Text(title).font(Theme.Font.serif(28)).multilineTextAlignment(.center)
                .foregroundColor(Theme.Color.ink)
            Text(subtitle).font(Theme.Font.sans(14)).multilineTextAlignment(.center)
                .foregroundColor(Theme.Color.inkSoft)
                .padding(.horizontal, 32)
            Spacer()
            Button(action: advance) {
                Text(step == 3 ? "Zacznij" : "Dalej")
                    .font(Theme.Font.sans(16)).fontWeight(.semibold)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity).padding(.vertical, 14)
                    .background(Capsule().fill(Theme.Color.gold))
            }
            .padding(.horizontal, 24)
            HStack(spacing: 6) {
                ForEach(0..<4, id: \.self) { i in
                    Circle().fill(i == step ? Theme.Color.gold : Theme.Color.rule)
                        .frame(width: 8, height: 8)
                }
            }
            .padding(.bottom, 32)
        }
        .background(Theme.Color.paper2.ignoresSafeArea())
    }

    private var title: String {
        ["Witaj, jarlu", "Przywołaj Oko", "Zrób zdjęcie", "Nazwij ogród"][step]
    }
    private var subtitle: String {
        [
            "Twój ogród czeka na ochronę. Freja patrzy.",
            "Znajdź urządzenie Freyr's Eye przez Bluetooth.",
            "Skald zidentyfikuje gatunek i dobierze progi.",
            "Nadaj sadowi imię — saga musi kogoś opiewać."
        ][step]
    }

    private func advance() {
        if step < 3 { step += 1 }
        else { app.onboardingDone = true; app.save() }
    }
}
