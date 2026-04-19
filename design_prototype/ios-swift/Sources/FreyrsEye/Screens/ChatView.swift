import SwiftUI

struct Message: Identifiable, Hashable {
    enum Role { case bot, user }
    let id = UUID()
    let role: Role
    let text: String
    let time: String
}

struct ChatView: View {
    @EnvironmentObject var app: AppState
    @State private var draft: String = ""
    @State private var messages: [Message] = [
        .init(role: .bot, text: "Witaj, strażniku sadu. Yggdrasil oddycha spokojnie — cóż cię trapi?", time: "9:38"),
        .init(role: .user, text: "Czy potrzebuje wody?", time: "9:39"),
        .init(role: .bot, text: "Nie dziś. Ziemia trzyma łaskę — 58%. Odwiedź go za trzy słońca.", time: "9:40"),
    ]
    private let suggestions = ["Jaka wróżba na dziś?", "Czy głodny?", "Dlaczego więdnie?"]

    var body: some View {
        VStack(spacing: 0) {
            header
            ScrollView {
                VStack(alignment: .leading, spacing: 10) {
                    contextCard
                    ForEach(messages) { m in bubble(m) }
                }
                .padding(Theme.Space.md)
            }
            footer
        }
        .background(Theme.Color.paper2.ignoresSafeArea())
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(app.tone == .saga ? "Oko Freyra" : "Asystent rośliny")
                .font(Theme.Font.serif(26)).foregroundColor(Theme.Color.ink)
            HStack(spacing: 6) {
                Circle().fill(Theme.Color.good).frame(width: 8, height: 8)
                Text(app.tone == .saga ? "CZUWA · YGGDRASIL MŁODSZY" : "ONLINE · MONSTERA")
                    .font(Theme.Font.mono(11)).tracking(0.8)
                    .foregroundColor(Theme.Color.inkSoft)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(Theme.Space.lg)
        .background(Theme.Color.paper)
        .overlay(Divider(), alignment: .bottom)
    }

    private var contextCard: some View {
        HStack(spacing: 10) {
            Text("ᚠ").font(Theme.Font.serif(22)).foregroundColor(Theme.Color.gold)
            Text(app.tone == .saga ? "Yggdrasil trwa w łasce Freyra."
                                   : "Monstera — stan OK, 58% wilgoci.")
                .font(Theme.Font.sans(12)).foregroundColor(Theme.Color.inkSoft)
            Spacer()
        }
        .padding(10)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(Theme.Color.gold.opacity(0.08))
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(Theme.Color.gold.opacity(0.3), lineWidth: 1))
        )
    }

    private func bubble(_ m: Message) -> some View {
        HStack {
            if m.role == .user { Spacer() }
            VStack(alignment: m.role == .user ? .trailing : .leading, spacing: 3) {
                Text(m.text)
                    .font(Theme.Font.sans(14))
                    .foregroundColor(m.role == .user ? .white : Theme.Color.ink)
                    .padding(.horizontal, 14).padding(.vertical, 10)
                    .background(
                        RoundedRectangle(cornerRadius: 18)
                            .fill(m.role == .user ? Theme.Color.gold : Theme.Color.paper)
                    )
                Text(m.time).font(Theme.Font.mono(9)).foregroundColor(Theme.Color.inkFaint)
            }
            if m.role == .bot { Spacer() }
        }
    }

    private var footer: some View {
        VStack(spacing: 10) {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 6) {
                    ForEach(suggestions, id: \.self) { s in
                        Text(s).font(Theme.Font.sans(12))
                            .padding(.horizontal, 12).padding(.vertical, 7)
                            .background(Capsule().fill(Theme.Color.paper2))
                    }
                }.padding(.horizontal, 2)
            }
            HStack(spacing: 8) {
                TextField(app.tone == .saga ? "Mów do Oka…" : "Napisz wiadomość…", text: $draft)
                    .padding(.horizontal, 14).padding(.vertical, 10)
                    .background(Capsule().fill(Theme.Color.paper2))
                Button(action: send) {
                    Text("↑").font(.system(size: 20, weight: .bold)).foregroundColor(.white)
                        .frame(width: 40, height: 40)
                        .background(Circle().fill(Theme.Color.gold))
                }
            }
        }
        .padding(Theme.Space.md)
        .background(Theme.Color.paper)
        .overlay(Divider(), alignment: .top)
    }

    private func send() {
        guard !draft.isEmpty else { return }
        messages.append(.init(role: .user, text: draft, time: "teraz"))
        draft = ""
        // TODO: call APIClient.chat
    }
}
