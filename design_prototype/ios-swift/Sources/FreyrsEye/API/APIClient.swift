import Foundation

/// Calls the Cloudflare Worker proxy (hides Gemini API key).
/// Configure BASE_URL in Info.plist → FEBackendURL
struct APIClient {
    static let shared = APIClient()

    var baseURL: URL {
        let s = Bundle.main.object(forInfoDictionaryKey: "FEBackendURL") as? String
            ?? "http://localhost:8787"
        return URL(string: s)!
    }

    // MARK: - Endpoints

    func identify(imageBase64: String) async throws -> IdentifyResponse {
        try await post("/identify", body: ["image": imageBase64])
    }

    func analyze(params: AnalyzeRequest) async throws -> AnalyzeResponse {
        try await post("/analyze", body: params)
    }

    func chat(sessionID: String, plantID: UUID, message: String, mode: Tone) async throws -> ChatResponse {
        try await post("/chat", body: [
            "sessionId": sessionID,
            "plantId": plantID.uuidString,
            "message": message,
            "mode": mode.rawValue
        ])
    }

    func saga(gardenName: String) async throws -> SagaResponse {
        try await post("/saga", body: ["gardenName": gardenName])
    }

    // MARK: - Core

    private func post<T: Decodable, B: Encodable>(_ path: String, body: B) async throws -> T {
        var req = URLRequest(url: baseURL.appendingPathComponent(path))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONEncoder().encode(body)
        let (data, resp) = try await URLSession.shared.data(for: req)
        guard let http = resp as? HTTPURLResponse, 200..<300 ~= http.statusCode else {
            throw URLError(.badServerResponse)
        }
        return try JSONDecoder().decode(T.self, from: data)
    }
}

// MARK: - Request / response types

struct IdentifyResponse: Codable {
    let common_name_pl: String
    let common_name_old_norse: String?
    let common_name_en: String
    let scientific_name: String
    let confidence: Double
    let alternatives: [String]
    let optimal_conditions: Optimal
    let care_notes: String
    let visible_issues: [String]
    let historical_use: String

    struct Optimal: Codable {
        let temperature_c: [Double]
        let humidity_pct: [Double]
        let light_lux: [Double]
        let soil_moisture_pct: [Double]
    }
}

struct AnalyzeRequest: Codable {
    let species: String
    let oldNorseName: String?
    let optimal: Plant.Optimal
    let current: Snapshot
    let avg24h: Snapshot
    let mode: Tone

    struct Snapshot: Codable {
        let temp: Double?; let humidity: Double?; let light: Double?; let soil: Double?
    }
}

struct AnalyzeResponse: Codable {
    let health_score: Int
    let message: String
    let issues: [Issue]
    let actions: [Action]

    struct Issue: Codable { let severity: String; let description: String }
    struct Action: Codable { let priority: Int; let action: String; let quantity: String; let deadline_hours: Int }
}

struct ChatResponse: Codable { let reply: String }
struct SagaResponse: Codable { let title: String; let body: String; let tone: String }

// MARK: - Mock fallback

enum MockAPI {
    static let demoFlax = IdentifyResponse(
        common_name_pl: "Len zwyczajny",
        common_name_old_norse: "Lín",
        common_name_en: "Common flax",
        scientific_name: "Linum usitatissimum",
        confidence: 0.92,
        alternatives: ["Lnica pospolita"],
        optimal_conditions: .init(temperature_c: [16, 24], humidity_pct: [40, 65], light_lux: [600, 1500], soil_moisture_pct: [40, 70]),
        care_notes: "Słońce 6+ godzin. Ziemia przepuszczalna, lekko wilgotna.",
        visible_issues: [],
        historical_use: "Wikingowie uprawiali len na włókno (żagle, ubrania) i olej z nasion."
    )
}
