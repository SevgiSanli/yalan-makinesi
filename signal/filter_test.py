import numpy as np
import scipy.signal as signal
import matplotlib.pyplot as plt

# 1. Sahte Gürültülü Sensör Verisi Oluşturma (50 Hz, 10 saniye)
fs = 50  # Örnekleme frekansı (50 Hz)
t = np.linspace(0, 10, fs * 10)
clean_signal = np.sin(2 * np.pi * 0.2 * t)  # 0.2 Hz Solunum/Terleme dalgası
noise = np.random.normal(0, 0.3, len(t))    # Elektriksel parazit
raw_signal = clean_signal + noise           # Ham sensör verisi

# 2. SciPy Alçak Geçiren Filtre (Butterworth Low-pass Filter)
cutoff = 1.0  # 1 Hz üzerindeki yüksek frekanslı gürültüleri kes
b, a = signal.butter(4, cutoff / (fs / 2), btype='low')
filtered_signal = signal.filtfilt(b, a, raw_signal)

# 3. Tepe Noktaları (Pikler/Stres Yükselişleri) Tespiti
peaks, _ = signal.find_peaks(filtered_signal, height=0.5)

# 4. Grafikle Gösterim
plt.figure(figsize=(10, 4))
plt.plot(t, raw_signal, label='Ham (Gürültülü) Veri', alpha=0.5, color='gray')
plt.plot(t, filtered_signal, label='SciPy Filtrelenmiş Veri', color='blue', linewidth=2)
plt.plot(t[peaks], filtered_signal[peaks], "x", label='Tepe Noktaları (Pikler)', color='red', markersize=10)
plt.title('Hafta 1: Sinyal Filtreleme ve Tepe Tespiti Prototipi')
plt.xlabel('Zaman (saniye)')
plt.ylabel('Amplitüd')
plt.legend()
plt.grid(True)
plt.show()