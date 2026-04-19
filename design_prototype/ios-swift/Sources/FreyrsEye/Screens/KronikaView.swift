import SwiftUI

struct KronikaView: View {
    @EnvironmentObject var app: AppState

    struct Event: Identifiable {
        let id = UUID()
        let day: String; let rune: String; let title: String; let detail: String
    }
    let events: [Event] = [
        .init(day: "Dziś", rune: "ᚹ", title: "Ziemia zaszeptała", detail: "28% · 14:22"),
        .init(day: "Dziś", rune: "ᛋ", title: "Słońce objęło korony", detail: "1240 lx · 12:05"),
        .init(day: "Wczoraj", rune: "ᛚ", title: "Nakarmiłeś Yggdrasila", detail: "180 ml · 18:40"),
        .init(day: "Wczoraj", rune: "ᚦ", title: "Freyr upomniał cię", detail: "22% · 09:15"),
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Space.lg) {
                NavHead(title: app.tone == .saga ? "Saga sadu" : "Zdarzenia", subtitle: "KRONIKA")
                Text(app.tone == .saga
                     ? "Każdy dzień zostawia znak. Przewiń wstecz, by ujrzeć drogę Yggdrasila."
                     : "Chronologiczna historia zdarzeń rośliny.")
                    .font(Theme.Font.sans(13)).foregroundColor(Theme.Color.inkSoft)

                ForEach(Dictionary(grouping: events, by: \.day).sorted(by: { $0.key < $1.key }), id: \.key) { day, items in
                    VStack(alignment: .leading, spacing: 8) {
                        Text(day.uppercased())
                            .font(Theme.Font.mono(10)).tracking(1.4)
                            .foregroundColor(Theme.Color.goldDeep)
                        ForEach(items) { e in eventRow(e) }
                    }
                }
            }
            .padding(Theme.Space.xl)
        }
        .background(Theme.Color.paper2.ignoresSafeArea())
    }

    private func eventRow(_ e: Event) -> some View {
        HStack(spacing: 14) {
            Text(e.rune).font(Theme.Font.serif(30)).foregroundColor(Theme.Color.gold)
                .frame(width: 40)
            VStack(alignment: .leading, spacing: 2) {
                Text(e.title).font(Theme.Font.serif(17)).foregroundColor(Theme.Color.ink)
                Text(e.detail).font(Theme.Font.mono(11)).foregroundColor(Theme.Color.inkFaint)
            }
            Spacer()
        }
        .padding(Theme.Space.md)
        .background(RoundedRectangle(cornerRadius: Theme.Radius.md).fill(Theme.Color.paper))
    }
}
