import Foundation
import Combine

enum Tone: String, Codable, CaseIterable { case saga, plain }

struct Plant: Codable, Identifiable, Hashable {
    var id: UUID = UUID()
    var name: String
    var oldNorseName: String?
    var species: String
    var scientificName: String
    var historicalUse: String?
    var optimal: Optimal
    var photoURL: URL?

    struct Optimal: Codable, Hashable {
        var soilMin: Double, soilMax: Double
        var lightMin: Double, lightMax: Double
        var tempMin: Double, tempMax: Double
        var humidityMin: Double, humidityMax: Double

        static let lenDefault = Optimal(
            soilMin: 40, soilMax: 70,
            lightMin: 600, lightMax: 1500,
            tempMin: 16, tempMax: 24,
            humidityMin: 40, humidityMax: 65
        )
    }

    static let demoFlax = Plant(
        name: "Yggdrasil Młodszy",
        oldNorseName: "Lín",
        species: "Len zwyczajny",
        scientificName: "Linum usitatissimum",
        historicalUse: "Wikingowie uprawiali len na włókno i olej z nasion.",
        optimal: .lenDefault
    )
}

@MainActor
final class AppState: ObservableObject {
    @Published var tone: Tone = .saga
    @Published var plants: [Plant] = [Plant.demoFlax]
    @Published var activePlantID: UUID? = Plant.demoFlax.id
    @Published var onboardingDone: Bool = true  // skip onboarding in demo

    var activePlant: Plant? {
        plants.first(where: { $0.id == activePlantID })
    }

    // MARK: - Persistence

    private let key = "freyrs.app.v1"
    init() { load() }

    func save() {
        let snap = Snapshot(tone: tone, plants: plants, activePlantID: activePlantID, onboardingDone: onboardingDone)
        if let data = try? JSONEncoder().encode(snap) {
            UserDefaults.standard.set(data, forKey: key)
        }
    }

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: key),
              let snap = try? JSONDecoder().decode(Snapshot.self, from: data) else { return }
        tone = snap.tone
        plants = snap.plants
        activePlantID = snap.activePlantID
        onboardingDone = snap.onboardingDone
    }

    private struct Snapshot: Codable {
        var tone: Tone
        var plants: [Plant]
        var activePlantID: UUID?
        var onboardingDone: Bool
    }
}
