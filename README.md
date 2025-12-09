📊 Akademik Vibe Charts - Akıllı Analiz Aracı

Ham veriyi (CSV) ve statik görselleri (OCR) akademik düzeyde içgörülere dönüştürmek için React, Python ve R teknolojilerini bir araya getiren tam yığın bir veri görselleştirme platformu.

🚀 Proje Özeti

Software Realization (Yazılım Gerçekleme) dersi için geliştirilen bu sistem, modern web teknolojileri ile istatistiksel hesaplama altyapısının kesintisiz entegrasyonunu göstermektedir.

Ana yenilik: Sistem, yalnızca yapılandırılmış veriyi (CSV) görselleştirmekle kalmaz, aynı zamanda OCR (Optical Character Recognition) kullanarak görsellerden veri “okuyabilir” ve bunu otomatik olarak analiz edilebilir grafiklere dönüştürebilir.

✨ Öne Çıkan Özellikler

Çok Dilli Mimari: React frontend ↔ Python backend ↔ R istatistik motoru

Görselden Grafiğe (OCR): Yüklenen görsellerden metin/veri çıkarmak için Tesseract-OCR kullanımı

Uyarlanabilir Görselleştirme: R motoru veri setinin büyüklüğünü otomatik algılar

Küçük veri: Dot plot / jitter gibi nokta tabanlı grafikler

Büyük veri: Aşırı bindirmeyi engellemek için hexbin veya yoğunluk grafikleri

Modern Arayüz: Tailwind CSS ile tasarlanmış “Premium Dark” temalı, cam efekti (glassmorphism) dokunuşlu UI

10 Farklı Grafik Türü: Histogram, yoğunluk grafiği, kutu grafiği (boxplot), dağılım grafiği (scatter), violin, çubuk grafik (bar), çizgi grafik (line), ısı haritası (heatmap), hexbin ve pasta grafik (pie)

🛠️ Teknoloji Yığını

Frontend: React (Vite), Tailwind CSS

Backend: Python (Flask), Tesseract-OCR

Analiz Motoru: R (ggplot2, dplyr, ggridges)

Geliştirme Araçları: Google AI Studio (mimari tasarım), NotebookLM (R standartları ve kod rehberliği)

⚙️ Önkoşullar

Projeyi çalıştırmadan önce aşağıdakilerin sisteminizde kurulu olduğundan emin olun:

Node.js ve Python 3.x

R dili ve şu paketler: ggplot2, dplyr, tidyr, ggridges, hexbin

Tesseract OCR motoru (görsel analiz için gereklidir)

Windows: PowerShell içinde winget install Tesseract-OCR

Mac: brew install tesseract

Linux: sudo apt-get install tesseract-ocr

📦 Kurulum

Depoyu klonlayın:

git clone https://github.com/karbarkurlas/vibechart.git
cd vibechart