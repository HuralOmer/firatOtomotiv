/* ============================================
   FIRAT OTOMOTİV - RANDEVU SİSTEMİ
   MSSQL Veritabanı Oluşturma Scripti
   ============================================ */

-- Veritabanı oluştur
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'FiratOtomotivDB')
BEGIN
    CREATE DATABASE FiratOtomotivDB;
END
GO

USE FiratOtomotivDB;
GO

/* ============================================
   1. ARAÇ MARKALARI TABLOSU
   ============================================ */
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AracMarkalar')
BEGIN
    CREATE TABLE AracMarkalar (
        MarkaID     INT IDENTITY(1,1) PRIMARY KEY,
        MarkaAdi    NVARCHAR(50) NOT NULL UNIQUE,
        Aktif       BIT DEFAULT 1,
        OlusturmaTarihi DATETIME DEFAULT GETDATE()
    );
END
GO

/* ============================================
   2. ARAÇ MODELLERİ TABLOSU
   ============================================ */
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AracModeller')
BEGIN
    CREATE TABLE AracModeller (
        ModelID     INT IDENTITY(1,1) PRIMARY KEY,
        MarkaID     INT NOT NULL,
        ModelAdi    NVARCHAR(50) NOT NULL,
        Aktif       BIT DEFAULT 1,
        OlusturmaTarihi DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_Model_Marka FOREIGN KEY (MarkaID)
            REFERENCES AracMarkalar(MarkaID)
    );
END
GO

/* ============================================
   3. ÇALIŞMA SAATLERİ TABLOSU
   Hangi günler hangi saatlerde açık
   ============================================ */
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CalismaSaatleri')
BEGIN
    CREATE TABLE CalismaSaatleri (
        SaatID      INT IDENTITY(1,1) PRIMARY KEY,
        GunNo       TINYINT NOT NULL,          -- 1=Pzt, 2=Sal, ..., 6=Cmt, 7=Paz
        GunAdi      NVARCHAR(10) NOT NULL,
        AcilisSaati TIME NOT NULL,
        KapanisSaati TIME NOT NULL,
        SlotSureDk  INT DEFAULT 30,            -- Randevu aralığı (dakika)
        Aktif       BIT DEFAULT 1              -- Pazar=0 (kapalı)
    );
END
GO

/* ============================================
   4. TATİL / KAPALI GÜNLER TABLOSU
   Özel kapalı günler (resmi tatil vb.)
   ============================================ */
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'KapaliGunler')
BEGIN
    CREATE TABLE KapaliGunler (
        KapaliGunID INT IDENTITY(1,1) PRIMARY KEY,
        Tarih       DATE NOT NULL UNIQUE,
        Aciklama    NVARCHAR(100),             -- "Resmi Tatil", "Bakım Günü" vb.
        OlusturmaTarihi DATETIME DEFAULT GETDATE()
    );
END
GO

/* ============================================
   5. RANDEVULAR TABLOSU (Ana Tablo)
   ============================================ */
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Randevular')
BEGIN
    CREATE TABLE Randevular (
        RandevuID       INT IDENTITY(1,1) PRIMARY KEY,
        AdSoyad         NVARCHAR(100) NOT NULL,
        Eposta          NVARCHAR(150) NOT NULL,
        Telefon         NVARCHAR(20) NOT NULL,
        MarkaID         INT NULL,
        ModelID         INT NULL,
        MarkaAdi        NVARCHAR(50) NULL,      -- Marka adı (Diğer seçimi için)
        ModelAdi        NVARCHAR(50) NULL,      -- Model adı (Diğer seçimi için)
        ModelYili       INT NULL,
        RandevuTarihi   DATE NOT NULL,
        RandevuSaati    TIME NOT NULL,
        Durum           NVARCHAR(20) DEFAULT 'Beklemede',
                        -- Beklemede, Onaylandi, IptalEdildi, Tamamlandi
        Notlar          NVARCHAR(500) NULL,
        OlusturmaTarihi DATETIME DEFAULT GETDATE(),
        GuncellemeTarihi DATETIME NULL,
        CONSTRAINT FK_Randevu_Marka FOREIGN KEY (MarkaID)
            REFERENCES AracMarkalar(MarkaID),
        CONSTRAINT FK_Randevu_Model FOREIGN KEY (ModelID)
            REFERENCES AracModeller(ModelID)
    );
END
GO

-- Randevu çakışmasını önlemek için unique index
CREATE UNIQUE NONCLUSTERED INDEX IX_Randevu_TarihSaat
ON Randevular (RandevuTarihi, RandevuSaati)
WHERE Durum != 'IptalEdildi';
GO

/* ============================================
   6. VARSAYILAN VERİLER
   ============================================ */

-- Araç Markaları
INSERT INTO AracMarkalar (MarkaAdi) VALUES
('Opel'), ('Chevrolet'), ('Volkswagen'), ('BMW'),
('Mercedes'), ('Audi'), ('Ford'), ('Renault'),
('Fiat'), ('Toyota'), ('Hyundai'), ('Peugeot'),
('Citroen'), ('Diğer');
GO

-- Araç Modelleri
INSERT INTO AracModeller (MarkaID, ModelAdi) VALUES
-- Opel
(1, 'Astra'), (1, 'Corsa'), (1, 'Insignia'), (1, 'Mokka'),
(1, 'Crossland'), (1, 'Grandland'), (1, 'Combo'), (1, 'Zafira'),
(1, 'Vectra'), (1, 'Meriva'),
-- Chevrolet
(2, 'Aveo'), (2, 'Cruze'), (2, 'Captiva'), (2, 'Spark'),
(2, 'Trax'), (2, 'Lacetti'), (2, 'Epica'), (2, 'Orlando'),
(2, 'Camaro'), (2, 'Tahoe'),
-- Volkswagen
(3, 'Golf'), (3, 'Passat'), (3, 'Polo'), (3, 'Tiguan'),
(3, 'T-Roc'), (3, 'Arteon'), (3, 'Caddy'), (3, 'Transporter'), (3, 'Jetta'),
-- BMW
(4, '3 Serisi'), (4, '5 Serisi'), (4, 'X1'), (4, 'X3'),
(4, 'X5'), (4, '1 Serisi'), (4, '4 Serisi'), (4, '7 Serisi'),
-- Mercedes
(5, 'A Serisi'), (5, 'C Serisi'), (5, 'E Serisi'), (5, 'S Serisi'),
(5, 'GLA'), (5, 'GLC'), (5, 'GLE'), (5, 'CLA'),
-- Audi
(6, 'A3'), (6, 'A4'), (6, 'A6'), (6, 'Q3'),
(6, 'Q5'), (6, 'Q7'), (6, 'A1'), (6, 'TT'),
-- Ford
(7, 'Focus'), (7, 'Fiesta'), (7, 'Kuga'), (7, 'Puma'),
(7, 'Ranger'), (7, 'Transit'), (7, 'Mondeo'), (7, 'EcoSport'),
-- Renault
(8, 'Clio'), (8, 'Megane'), (8, 'Captur'), (8, 'Kadjar'),
(8, 'Taliant'), (8, 'Kangoo'), (8, 'Fluence'),
-- Fiat
(9, 'Egea'), (9, 'Panda'), (9, '500'), (9, 'Tipo'),
(9, 'Doblo'), (9, 'Linea'),
-- Toyota
(10, 'Corolla'), (10, 'Yaris'), (10, 'C-HR'), (10, 'RAV4'),
(10, 'Camry'), (10, 'Hilux'),
-- Hyundai
(11, 'i20'), (11, 'i30'), (11, 'Tucson'), (11, 'Kona'),
(11, 'Bayon'), (11, 'Elantra'),
-- Peugeot
(12, '208'), (12, '308'), (12, '3008'), (12, '2008'),
(12, '5008'), (12, '508'), (12, 'Rifter'),
-- Citroen
(13, 'C3'), (13, 'C4'), (13, 'C5 Aircross'), (13, 'Berlingo'),
(13, 'C-Elysee'),
-- Diğer
(14, 'Diğer Model');
GO

-- Çalışma Saatleri (Pzt-Cmt açık, Paz kapalı)
INSERT INTO CalismaSaatleri (GunNo, GunAdi, AcilisSaati, KapanisSaati, SlotSureDk, Aktif) VALUES
(1, 'Pazartesi', '09:00', '17:30', 30, 1),
(2, 'Salı',      '09:00', '17:30', 30, 1),
(3, 'Çarşamba',  '09:00', '17:30', 30, 1),
(4, 'Perşembe',  '09:00', '17:30', 30, 1),
(5, 'Cuma',      '09:00', '17:30', 30, 1),
(6, 'Cumartesi', '09:00', '17:30', 30, 1),
(7, 'Pazar',     '00:00', '00:00', 30, 0);
GO

/* ============================================
   7. YARDIMCI GÖRÜNÜMLER (VIEW)
   ============================================ */

-- Bugünden itibaren dolu slotları listele
CREATE OR ALTER VIEW vw_DoluSlotlar AS
SELECT
    RandevuTarihi,
    RandevuSaati,
    AdSoyad,
    Telefon,
    MarkaAdi,
    ModelAdi,
    Durum
FROM Randevular
WHERE Durum NOT IN ('IptalEdildi')
  AND RandevuTarihi >= CAST(GETDATE() AS DATE);
GO

-- Bugünden itibaren müsait tarihleri kontrol et
CREATE OR ALTER VIEW vw_GunlukRandevuSayisi AS
SELECT
    RandevuTarihi,
    COUNT(*) AS ToplamRandevu,
    -- 17 slot var (09:00-17:00, 30dk aralık)
    CASE WHEN COUNT(*) >= 17 THEN 1 ELSE 0 END AS TamDolu
FROM Randevular
WHERE Durum NOT IN ('IptalEdildi')
  AND RandevuTarihi >= CAST(GETDATE() AS DATE)
GROUP BY RandevuTarihi;
GO

/* ============================================
   8. STORED PROCEDURE: Randevu Oluştur
   ============================================ */
CREATE OR ALTER PROCEDURE sp_RandevuOlustur
    @AdSoyad        NVARCHAR(100),
    @Eposta         NVARCHAR(150),
    @Telefon        NVARCHAR(20),
    @MarkaAdi       NVARCHAR(50),
    @ModelAdi       NVARCHAR(50) = NULL,
    @ModelYili       INT = NULL,
    @RandevuTarihi  DATE,
    @RandevuSaati   TIME,
    @Sonuc          INT OUTPUT,        -- 1=Başarılı, 0=Dolu, -1=Hata
    @Mesaj          NVARCHAR(200) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Tarih geçmiş mi kontrol et
    IF @RandevuTarihi < CAST(GETDATE() AS DATE)
    BEGIN
        SET @Sonuc = -1;
        SET @Mesaj = N'Geçmiş bir tarihe randevu oluşturulamaz.';
        RETURN;
    END

    -- 2. Kapalı gün mü kontrol et
    IF EXISTS (SELECT 1 FROM KapaliGunler WHERE Tarih = @RandevuTarihi)
    BEGIN
        SET @Sonuc = -1;
        SET @Mesaj = N'Seçilen tarih kapalı gündür.';
        RETURN;
    END

    -- 3. Pazar günü mü kontrol et
    IF DATEPART(WEEKDAY, @RandevuTarihi) = 1  -- SQL Server varsayılan: 1=Pazar
    BEGIN
        SET @Sonuc = -1;
        SET @Mesaj = N'Pazar günleri servis kapalıdır.';
        RETURN;
    END

    -- 4. Slot dolu mu kontrol et
    IF EXISTS (
        SELECT 1 FROM Randevular
        WHERE RandevuTarihi = @RandevuTarihi
          AND RandevuSaati = @RandevuSaati
          AND Durum != 'IptalEdildi'
    )
    BEGIN
        SET @Sonuc = 0;
        SET @Mesaj = N'Seçilen tarih ve saat dolu.';
        RETURN;
    END

    -- 5. Marka ID bul
    DECLARE @MarkaID INT = NULL, @ModelID INT = NULL;
    SELECT @MarkaID = MarkaID FROM AracMarkalar WHERE MarkaAdi = @MarkaAdi;
    IF @ModelAdi IS NOT NULL AND @MarkaID IS NOT NULL
        SELECT @ModelID = ModelID FROM AracModeller
        WHERE MarkaID = @MarkaID AND ModelAdi = @ModelAdi;

    -- 6. Randevuyu kaydet
    BEGIN TRY
        INSERT INTO Randevular (
            AdSoyad, Eposta, Telefon,
            MarkaID, ModelID, MarkaAdi, ModelAdi, ModelYili,
            RandevuTarihi, RandevuSaati, Durum
        ) VALUES (
            @AdSoyad, @Eposta, @Telefon,
            @MarkaID, @ModelID, @MarkaAdi, @ModelAdi, @ModelYili,
            @RandevuTarihi, @RandevuSaati, 'Beklemede'
        );

        SET @Sonuc = 1;
        SET @Mesaj = N'Randevunuz başarıyla oluşturuldu.';
    END TRY
    BEGIN CATCH
        SET @Sonuc = -1;
        SET @Mesaj = ERROR_MESSAGE();
    END CATCH
END
GO

/* ============================================
   9. STORED PROCEDURE: Dolu Slotları Getir
   Belirli bir tarihteki dolu saatleri döndürür
   ============================================ */
CREATE OR ALTER PROCEDURE sp_DoluSlotlariGetir
    @Tarih DATE
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CONVERT(VARCHAR(5), RandevuSaati, 108) AS Saat
    FROM Randevular
    WHERE RandevuTarihi = @Tarih
      AND Durum NOT IN ('IptalEdildi')
    ORDER BY RandevuSaati;
END
GO

/* ============================================
   10. STORED PROCEDURE: Tam Dolu Günleri Getir
   Tüm slotları dolu olan günleri döndürür
   ============================================ */
CREATE OR ALTER PROCEDURE sp_DoluGunleriGetir
    @BaslangicTarihi DATE,
    @BitisTarihi     DATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Kapalı günler
    SELECT Tarih FROM KapaliGunler
    WHERE Tarih BETWEEN @BaslangicTarihi AND @BitisTarihi

    UNION

    -- 17 slotun tamamı dolu olan günler
    SELECT RandevuTarihi FROM Randevular
    WHERE RandevuTarihi BETWEEN @BaslangicTarihi AND @BitisTarihi
      AND Durum NOT IN ('IptalEdildi')
    GROUP BY RandevuTarihi
    HAVING COUNT(*) >= 17

    ORDER BY Tarih;
END
GO

PRINT N'✅ Fırat Otomotiv veritabanı başarıyla oluşturuldu!';
GO
