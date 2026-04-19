import SwiftUI

struct HordaView: View {
    @EnvironmentObject var app: AppState

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Space.lg) {
                NavHead(title: "Horda Oczu", subtitle: "SAD")
                ForEach(app.plants) { p in plantRow(p) }
            }
            .padding(Theme.Space.xl)
        }
        .background(Theme.Color.paper2.ignoresSafeArea())
    }

    private func plantRow(_ p: Plant) -> some View {
        HStack(spacing: 14) {
            RoundedRectangle(cornerRadius: 12).fill(Theme.Color.goldSoft.opacity(0.4))
                .frame(width: 48, height: 48)
                .overlay(Text("ᛃ").font(Theme.Font.serif(26)).foregroundColor(Theme.Color.goldDeep))
            VStack(alignment: .leading, spacing: 2) {
                Text(p.name).font(Theme.Font.serif(18)).foregroundColor(Theme.Color.ink)
                Text([p.oldNorseName, p.species].compactMap { $0 }.joined(separator: " · "))
                    .font(Theme.Font.mono(11)).foregroundColor(Theme.Color.inkFaint)
            }
            Spacer()
            Circle().fill(Theme.Color.good).frame(width: 10, height: 10)
        }
        .padding(Theme.Space.md)
        .background(RoundedRectangle(cornerRadius: Theme.Radius.md).fill(Theme.Color.paper))
    }
}
