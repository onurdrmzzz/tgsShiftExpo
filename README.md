# TGS Vardiya

Vardiyalı çalışanlar için geliştirilmiş vardiya takip ve planlama uygulaması.

## Özellikler

- **%60 Sistem:** 8 günlük otomatik döngü hesaplama (S-S-A-A-G-G-İ-İ)
- **%30 Sistem:** Excel dosyasından aylık program yükleme
- **Takvim Görünümü:** Aylık vardiya planı
- **Haftalık Önizleme:** 7 günlük vardiya özeti
- **Excel Import:** .xlsx dosyasından otomatik yükleme
- **Açık/Koyu Tema:** Göz dostu arayüz

## Desteklenen Vardiya Tipleri

| Kod | Vardiya | Saat |
|-----|---------|------|
| S | Sabah | 06:00 - 14:00 |
| A | Akşam | 14:00 - 22:00 |
| G | Gece | 22:00 - 06:00 |
| İ | İzin | - |
| Y | Yıllık İzin | - |
| E | Eğitim | 09:00 - 17:00 |
| N | Normal | 09:00 - 18:00 |
| R | Raporlu | - |
| M | Mazeret | - |

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npx expo start
```

## Build

```bash
# Test için APK
eas build --platform android --profile preview

# Play Store için AAB
eas build --platform android --profile production
```

## Teknolojiler

- React Native / Expo SDK 54
- TypeScript
- Zustand (State Management)
- React Navigation
- XLSX (Excel Parser)

## Proje Yapısı

```
src/
├── components/     # UI bileşenleri
├── constants/      # Sabitler, renkler, strings
├── hooks/          # Custom hooks
├── navigation/     # React Navigation yapısı
├── screens/        # Uygulama ekranları
├── services/       # İş mantığı, Excel parser
├── store/          # Zustand store
├── types/          # TypeScript tipleri
└── utils/          # Yardımcı fonksiyonlar
```

## Ekranlar

- **OnboardingScreen:** Sistem ve ekip seçimi
- **HomeScreen:** Bugün/yarın/haftalık vardiyalar
- **CalendarScreen:** Aylık takvim görünümü
- **SettingsScreen:** Ayarlar ve Excel import
- **ExcelImportScreen:** Excel dosyası yükleme

## Lisans

MIT
