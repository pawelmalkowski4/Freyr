import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var app: AppState
    @EnvironmentObject var sensors: SensorStore

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Space.lg) {
                NavHead(title: "Wzrok Freja", subtitle: "DZIŚ · YGGDRASIL MŁODSZY")

                graceCard

                if let plant = app.activePlant {
                    VStack(spacing: 14) {
                        SensorBar(label: "Woda (gleba)", rune: "ᛚ",
                                  value: Double(sensors.soil ?? 0), unit: "%",
                                  min: 0, max: 100,
                                  optMin: plant.optimal.soilMin, optMax: plant.optimal.soilMax)
                        SensorBar(label: "Słońce", rune: "ᛋ",
                                  value: sensors.light ?? 0, unit: " lx",
                                  min: 0, max: 2000,
                                  optMin: plant.optimal.lightMin, optMax: plant.optimal.lightMax)
                        SensorBar(label: "Ciepło", rune: "ᚦ",
                                  value: sensors.temp ?? 0, unit: "°C",
                                  min: 0, max: 40,
                                  optMin: plant.optimal.tempMin, optMax: plant.optimal.tempMax)
                        SensorBar(label: "Wilgoć powietrza", rune: "ᚹ",
                                  value: sensors.humidity ?? 0, unit: "%",
                                  min: 0, max: 100,
                                  optMin: plant.optimal.humidityMin, optMax: plant.optimal.humidityMax)
                    }
                    .padding(Theme.Space.lg)
                    .background(RoundedRectangle(cornerRadius: Theme.Radius.lg).fill(Theme.Color.paper))
                }
            }
            .padding(Theme.Space.xl)
        }
        .background(Theme.Color.paper2.ignoresSafeArea())
    }

    private var graceCard: some View {
        let score = sensors.graceScore(for: app.activePlant?.optimal ?? .lenDefault)
        return Card {
            VStack(alignment: .leading, spacing: 10) {
                Chip(text: "ŁASKA FREJA")
                HStack(alignment: .lastTextBaseline, spacing: 4) {
                    Text("\(score)")
                        .font(Theme.Font.serif(72))
                        .foregroundColor(Theme.Color.gold)
                    Text("/100").font(Theme.Font.sans(16)).foregroundColor(Theme.Color.inkFaint)
                }
                Text(message(for: score))
                    .font(Theme.Font.serif(18))
                    .foregroundColor(Theme.Color.inkSoft)
            }
        }
    }

    private func message(for score: Int) -> String {
        if app.tone == .plain {
            if score >= 70 { return "Warunki w normie." }
            if score >= 40 { return "Uwaga: parametry poza zakresem." }
            return "Alarm: krytyczne warunki."
        }
        if score >= 70 { return "Freja błogosławi temu zielu." }
        if score >= 40 { return "Ziemia schnie. Freja mruży oko." }
        return "Gniew Freja. Działaj pośpiesznie."
    }
}
