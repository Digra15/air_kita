# Panduan Pengembangan Aplikasi Mobile (Flutter) - Air Kita

Dokumen ini berisi panduan untuk menghubungkan aplikasi mobile Flutter dengan backend Next.js "Air Kita" yang sudah ada.

## 1. Persiapan API Backend

API Endpoint berikut telah dibuat di proyek Next.js untuk mendukung aplikasi mobile:

*   **Login**: `POST /api/mobile/auth/login`
    *   Body: `{ "email": "admin@example.com", "password": "password" }`
    *   Response: `{ "success": true, "user": { ... } }`
*   **Daftar Pelanggan**: `GET /api/mobile/customers?query=nama`
*   **Input Meter**: `POST /api/mobile/meter`
    *   Body: `{ "customerId": "...", "currentReading": 120, "month": 10, "year": 2023 }`
*   **Daftar Tagihan**: `GET /api/mobile/bills?status=UNPAID`

## 2. Struktur Proyek Flutter

Disarankan menggunakan struktur folder berikut di proyek Flutter Anda (`lib/`):

```
lib/
├── models/
│   ├── user.dart
│   ├── customer.dart
│   └── bill.dart
├── services/
│   ├── api_service.dart
│   └── printer_service.dart
├── screens/
│   ├── login_screen.dart
│   ├── home_screen.dart
│   ├── meter_input_screen.dart
│   └── billing_screen.dart
└── main.dart
```

## 3. Dependencies (pubspec.yaml)

Tambahkan paket berikut ke `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.2.0
  shared_preferences: ^2.2.2
  intl: ^0.19.0
  blue_thermal_printer: ^1.2.3  # Untuk cetak struk via Bluetooth
  esc_pos_utils: ^2.0.0         # Untuk format struk
```

## 4. Contoh Kode Implementasi

### A. API Service (`lib/services/api_service.dart`)

Ganti `BASE_URL` dengan alamat IP komputer Anda (jika di emulator Android gunakan `10.0.2.2`).

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Ganti dengan IP lokal komputer Anda jika testing di HP fisik
  // static const String baseUrl = 'http://192.168.1.x:3000/api/mobile';
  static const String baseUrl = 'http://10.0.2.2:3000/api/mobile'; 

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    return jsonDecode(response.body);
  }

  Future<List<dynamic>> getCustomers(String query) async {
    final response = await http.get(Uri.parse('$baseUrl/customers?query=$query'));
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data'];
    }
    return [];
  }

  Future<Map<String, dynamic>> submitMeter({
    required String customerId,
    required double currentReading,
    required int month,
    required int year,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/meter'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'customerId': customerId,
        'currentReading': currentReading,
        'month': month,
        'year': year,
      }),
    );
    return jsonDecode(response.body);
  }

  Future<List<dynamic>> getUnpaidBills() async {
    final response = await http.get(Uri.parse('$baseUrl/bills?status=UNPAID'));
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data'];
    }
    return [];
  }
}
```

### B. Printer Service (`lib/services/printer_service.dart`)

Contoh sederhana untuk mencetak struk menggunakan `blue_thermal_printer`.

```dart
import 'package:blue_thermal_printer/blue_thermal_printer.dart';

class PrinterService {
  BlueThermalPrinter bluetooth = BlueThermalPrinter.instance;

  Future<void> printBill(Map<String, dynamic> bill) async {
    if ((await bluetooth.isConnected) == true) {
      bluetooth.printNewLine();
      bluetooth.printCustom("AIR KITA", 3, 1);
      bluetooth.printCustom("Tagihan Air Bersih", 1, 1);
      bluetooth.printNewLine();
      bluetooth.printLeftRight("Pelanggan:", bill['customerName'], 1);
      bluetooth.printLeftRight("Meteran:", bill['meterNumber'], 1);
      bluetooth.printLeftRight("Periode:", "${bill['month']}/${bill['year']}", 1);
      bluetooth.printNewLine();
      bluetooth.printLeftRight("Pakai:", "${bill['usage']} m3", 1);
      bluetooth.printLeftRight("Meter Akhir:", "${bill['currentReading']}", 1);
      bluetooth.printNewLine();
      bluetooth.printLeftRight("TOTAL:", "Rp ${bill['amount']}", 2); // Besar
      bluetooth.printNewLine();
      bluetooth.printCustom("Terima Kasih", 1, 1);
      bluetooth.printNewLine();
      bluetooth.paperCut();
    }
  }
}
```

## 5. Langkah Selanjutnya

1.  Buat project Flutter baru: `flutter create air_kita_mobile`
2.  Copy kode di atas ke file yang sesuai.
3.  Jalankan server Next.js (`npm run dev`).
4.  Pastikan HP/Emulator satu jaringan dengan komputer.
5.  Mulai development UI di Flutter.
