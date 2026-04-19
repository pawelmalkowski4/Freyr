import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var app: AppState

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Space.lg) {
                NavHead(title: "Ustawienia ogrodu", subtitle: "USTAWIENIA")

                sectionCard(title: "TRYB NARRACJI") {
                    Picker("Tryb", selection: $app.tone) {
                        Text("Saga").tag(Tone.saga)
                        Text("Zwykły").tag(Tone.plain)
                    }
                    .pickerStyle(.segmented)
                    Text(app.tone == .saga
                         ? "Skald-zielarz mówi językiem run. Pełna stylizacja."
                         : "Konkretny polski, bez ozdób.")
                        .font(Theme.Font.sans(12)).foregroundColor(Theme.Color.inkSoft)
                }

                sectionCard(title: "OKO — URZĄDZENIE") {
                    row("Nazwa", "Freyr-Eye-A7F2")
                    row("Częstotliwość pomiarów", "30 s")
                    row("Próg wybudzenia OLED", "30 cm")
                    row("Bateria", "87%")
                }

                sectionCard(title: "PROGI ŁASKI (auto z gatunku)") {
                    row("Wilgoć gleby", "40–70%")
                    row("Światło", "600–1500 lx")
                    row("Temperatura", "16–24°C")
                }
            }
            .padding(Theme.Space.xl)
        }
        .background(Theme.Color.paper2.ignoresSafeArea())
        .onChange(of: app.tone) { _ in app.save() }
    }

    private func sectionCard<C: View>(title: String, @ViewBuilder _ content: () -> C) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title).font(Theme.Font.mono(10)).tracking(1.4)
                .foregroundColor(Theme.Color.goldDeep)
            content()
        }
        .padding(Theme.Space.lg)
        .background(RoundedRectangle(cornerRadius: Theme.Radius.lg).fill(Theme.Color.paper))
    }

    private func row(_ k: String, _ v: String) -> some View {
        HStack {
            Text(k).font(Theme.Font.sans(13)).foregroundColor(Theme.Color.inkSoft)
            Spacer()
            Text(v).font(Theme.Font.mono(12)).foregroundColor(Theme.Color.ink)
        }
        .padding(.vertical, 4)
    }
}
