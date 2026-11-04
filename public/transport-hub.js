(function(){
        const translations = {
            en: {
                appSubTitle: "Campus • City • Transport",
                mainHeaderTitle: "Transport Schedules",
                mainHeaderDesc: "Select an option to view timetables and route details.",
                cousBadge: "Student Bus",
                cousCardTitle: "COUS Transport",
                cousCardDesc: "Ministry of Higher Education student buses. Access via ENSTP student card for campus hubs and city lines.",
                cousBtnText: "See Schedules",
                etusaBadge: "Public Transit",
                etusaCardTitle: "ETUSA Bus Lines",
                etusaCardDesc: "Public urban transit schedules connecting Station Kouba, 1er Mai, Audin, Martyrs, and surrounding hubs.",
                etusaBtnText: "See Bus Lines",
                modalHeaderTitle: "Bus Schedules & Timetables",
                modalHeaderSubtitle: "ENSTP Student & Public Transit Lines",
                modalTabCous: "COUS (Student)",
                modalTabEtusa: "ETUSA (Transit)",
                lblFixedHeader: "Fixed Departure Times",
                lbl24h: "24-Hour Format",
                lblContinuousHeader: "Continuous Shuttle Loop Windows",
                lblShuttleBadge: "High Frequency",
                searchPlaceholder: "Search destination, line...",
                emptyTitle: "No routes match your search",
                emptyDesc: "Try typing a different destination name or line number.",
                footerCopy: "© ENSTP Student Guide • Campus Transport Portal",
                footerNote: "Updated for COUS student routes & ETUSA transit lines.",
                departuresLabel: "Departures",
                destinationsLabel: "Destinations",
                coveredHubsLabel: "Covered Hubs",
                continuousLoopBadge: "Continuous Loop",
                filterAll: "All Lines",
                filterLineWord: "Line"
            },
            fr: {
                appSubTitle: "Campus • Ville • Transport",
                mainHeaderTitle: "Horaires des Transports",
                mainHeaderDesc: "Sélectionnez une option pour consulter les horaires et trajets.",
                cousBadge: "Bus Étudiant",
                cousCardTitle: "Transport COUS",
                cousCardDesc: "Bus étudiants du Ministère de l'Enseignement Supérieur. Accès par carte étudiant ENSTP.",
                cousBtnText: "Voir les Horaires",
                etusaBadge: "Transport Public",
                etusaCardTitle: "Lignes ETUSA",
                etusaCardDesc: "Lignes de transport public urbain reliant Station Kouba, 1er Mai, Audin et la Grande Poste.",
                etusaBtnText: "Voir les Lignes",
                modalHeaderTitle: "Horaires des Bus et Trajets",
                modalHeaderSubtitle: "Lignes Étudiantes ENSTP & Transport Public",
                modalTabCous: "COUS (Étudiant)",
                modalTabEtusa: "ETUSA (Public)",
                lblFixedHeader: "Départs à Heures Fixes",
                lbl24h: "Format 24 Heures",
                lblContinuousHeader: "Plages Horaires des Navettes Continues",
                lblShuttleBadge: "Haute Fréquence",
                searchPlaceholder: "Rechercher destination, ligne...",
                emptyTitle: "Aucune route ne correspond à votre recherche",
                emptyDesc: "Essayez de taper un autre nom de destination ou numéro de ligne.",
                footerCopy: "© Guide Étudiant ENSTP • Portail Transport du Campus",
                footerNote: "Mis à jour pour les trajets étudiants COUS et lignes ETUSA.",
                departuresLabel: "Départs",
                destinationsLabel: "Destinations",
                coveredHubsLabel: "Stations Desservies",
                continuousLoopBadge: "Ligne Continue",
                filterAll: "Toutes les Lignes",
                filterLineWord: "Ligne"
            },
            ar: {
                appSubTitle: "المركب • المدينة • النقل",
                mainHeaderTitle: "مواقيت النقل والرحلات",
                mainHeaderDesc: "اختر نوع النقل لمراجعة مواعيد وانطلاق الحافلات.",
                cousBadge: "حافلات الطلبة",
                cousCardTitle: "الخدمات الجامعية (COUS)",
                cousCardDesc: "حافلات النقل الجامعي المخصصة للطلبة. الدخول ببطاقة الطالب لربط الإقامات والمركب.",
                cousBtnText: "عرض مواقيت الرحلات",
                etusaBadge: "النقل العمومي",
                etusaCardTitle: "حافلات إيتوزا (ETUSA)",
                etusaCardDesc: "شبكة حافلات النقل العمومي الحضري التي تربط محطة القبة، ساحة أول ماي، وأودان.",
                etusaBtnText: "عرض خطوط إيتوزا",
                modalHeaderTitle: "مواقيت وخطوط الحافلات",
                modalHeaderSubtitle: "خطوط النقل الجامعي والعمومي الخاصة بالمركب",
                modalTabCous: "الخدمات الجامعية (COUS)",
                modalTabEtusa: "حافلات إيتوزا (ETUSA)",
                lblFixedHeader: "مواعيد الانطلاق المحددة",
                lbl24h: "توقيت 24 ساعة",
                lblContinuousHeader: "رحلات النقل المستمر (المكوكية)",
                lblShuttleBadge: "تردد عالٍ",
                searchPlaceholder: "ابحث عن الوجهة، المحطة، أو رقم الخط...",
                emptyTitle: "لم يتم العثور على نتائج مطابقة",
                emptyDesc: "تأكد من كتابة اسم المحطة أو رقم الخط بشكل صحيح.",
                footerCopy: "© الدليل الطلابي لـ ENSTP • بوابة النقل للمركب",
                footerNote: "معلومات محدثة مستخرجة من جداول الخدمات الجامعية وإيتوزا.",
                departuresLabel: "مواعيد الانطلاق",
                destinationsLabel: "الوجهات والمحطات",
                coveredHubsLabel: "المحطات المشمولة",
                continuousLoopBadge: "خط مستمر",
                filterAll: "جميع الخطوط",
                filterLineWord: "خط"
            }
        };

        const cousFixedData = [
            {
                time: "02:30",
                frequency: { en: "Every 1h", fr: "Chaque 1h", ar: "كل 1 ساعة" },
                destinations: {
                    en: ["Sidi Abdellah", "Blida", "Draria", "Koléa", "Bousmaïl", "Hadjout", "Tipaza", "Ben Talha", "Baraki", "Boufarik", "Zéralda"],
                    fr: ["Sidi Abdellah", "Blida", "Draria", "Koléa", "Bousmaïl", "Hadjout", "Tipaza", "Ben Talha", "Baraki", "Boufarik", "Zéralda"],
                    ar: ["سيدي عبد الله", "البليدة", "الدرارية", "القليعة", "بوسماعيل", "حجوط", "تيبازة", "بن طلحة", "براقي", "بوفاريك", "زرالدة"]
                },
                type: "regular"
            },
            {
                time: "02:30",
                frequency: { en: "Every 1h", fr: "Chaque 1h", ar: "كل 1 ساعة" },
                destinations: {
                    en: ["Kalitous", "Larbaâ"],
                    fr: ["Kalitous", "Larbaâ"],
                    ar: ["كاليتوس", "الأربعاء"]
                },
                type: "regular"
            },
            {
                time: "07:00",
                frequency: { en: "Single Departure", fr: "Départ Unique", ar: "انطلاق واحد" },
                destinations: {
                    en: ["Bab El Oued"],
                    fr: ["Bab El Oued"],
                    ar: ["باب الواد"]
                },
                type: "single"
            },
            {
                time: "16:00",
                frequency: { en: "Every 1h", fr: "Chaque 1h", ar: "كل 1 ساعة" },
                destinations: {
                    en: ["Sidi Abdellah", "Blida", "Draria", "Koléa", "Bousmaïl", "Hadjout", "Tipaza", "Ben Talha", "Baraki", "Saoula", "Zéralda"],
                    fr: ["Sidi Abdellah", "Blida", "Draria", "Koléa", "Bousmaïl", "Hadjout", "Tipaza", "Ben Talha", "Baraki", "Saoula", "Zéralda"],
                    ar: ["سيدي عبد الله", "البليدة", "الدرارية", "القليعة", "بوسماعيل", "حجوط", "تيبازة", "بن طلحة", "براقي", "السحاولة", "زرالدة"]
                },
                type: "regular"
            },
            {
                time: "16:00",
                frequency: { en: "Every 1h", fr: "Chaque 1h", ar: "كل 1 ساعة" },
                destinations: {
                    en: ["Kalitous", "Larbaâ"],
                    fr: ["Kalitous", "Larbaâ"],
                    ar: ["كاليتوس", "الأربعاء"]
                },
                type: "regular"
            },
            {
                time: "17:15",
                frequency: { en: "Single Departure", fr: "Départ Unique", ar: "انطلاق واحد" },
                destinations: {
                    en: ["Hadjout"],
                    fr: ["Hadjout"],
                    ar: ["حجوط"]
                },
                type: "single"
            }
        ];

        const cousContinuousData = [
            {
                window: "07:00 - 16:00",
                destinations: {
                    en: ["Ben Aknoun", "Bach Djerrah", "El Harrach"],
                    fr: ["Ben Aknoun", "Bach Djerrah", "El Harrach"],
                    ar: ["بن عكنون", "باش جراح", "الحراش"]
                }
            },
            {
                window: "07:00 - 16:30",
                destinations: {
                    en: ["Bouzaréah", "Dely Brahim"],
                    fr: ["Bouzaréah", "Dely Brahim"],
                    ar: ["بوزريعة", "دالي ابراهيم"]
                }
            },
            {
                window: "07:00 - 17:15",
                destinations: {
                    en: ["Tafourah", "Rouiba (4)", "Rouiba (5)", "Djorf"],
                    fr: ["Tafourah", "Rouiba (4)", "Rouiba (5)", "Djorf"],
                    ar: ["تافورة", "الرويبة (4)", "الرويبة (5)", "الجرف"]
                }
            },
            {
                window: "07:00 - 17:15",
                destinations: {
                    en: ["Saïd Hamdine", "Ouled Fayet"],
                    fr: ["Saïd Hamdine", "Ouled Fayet"],
                    ar: ["سعيد حمدين", "أولاد فايت"]
                }
            }
        ];

        const etusaLinesData = [
            {
                id: "189",
                code: { en: "LINE 189", fr: "LIGNE 189", ar: "الخط 189" },
                terminals: {
                    en: { A: "Place du 1er Mai", B: "Station Intermodale de Kouba" },
                    fr: { A: "Place du 1er Mai", B: "Station Intermodale de Kouba" },
                    ar: { A: "ساحة أول ماي", B: "محطة القبة متعددة الأنواط" }
                },
                departuresA: ["06:50", "07:20", "07:50", "08:30", "09:00", "09:30", "10:10", "10:40", "11:10", "11:50", "12:20", "12:50", "13:20", "13:50", "14:20", "15:00", "15:30", "16:00", "16:40", "17:10", "17:40", "18:20", "18:50", "19:20"],
                departuresB: ["06:00", "06:30", "07:00", "07:40", "08:10", "08:40", "09:20", "09:50", "10:20", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:10", "14:40", "15:10", "15:50", "16:20", "16:50", "17:30", "18:00", "18:30"],
                note: null
            },
            {
                id: "L06",
                code: { en: "LINE L06 (Primary)", fr: "LIGNE L06 (Principal)", ar: "الخط L06 (رئيسي)" },
                terminals: {
                    en: { A: "Place des Martyrs", B: "Station Intermodale de Kouba" },
                    fr: { A: "Place des Martyrs", B: "Station Intermodale de Kouba" },
                    ar: { A: "ساحة الشهداء", B: "محطة القبة متعددة الأنواط" }
                },
                departuresA: ["05:40", "06:20", "07:20", "08:00", "09:10", "09:50", "10:50", "11:30", "12:10", "12:50", "13:40", "14:20", "15:20", "16:00", "17:00", "17:40"],
                departuresB: ["06:30", "07:10", "08:20", "09:00", "10:00", "10:40", "11:30", "12:10", "12:50", "13:30", "14:30", "15:10", "16:10", "16:50", "17:50", "18:30"],
                note: { en: "Daily main schedule", fr: "Programme quotidien principal", ar: "المبرمج الرئيسي اليومي" }
            },
            {
                id: "L06-2",
                code: { en: "LINE L06 (Secondary)", fr: "LIGNE L06 (Secondaire)", ar: "الخط L06 (ثانوي)" },
                terminals: {
                    en: { A: "Place des Martyrs", B: "Station Intermodale de Kouba" },
                    fr: { A: "Place des Martyrs", B: "Station Intermodale de Kouba" },
                    ar: { A: "ساحة الشهداء", B: "محطة القبة متعددة الأنواط" }
                },
                departuresA: ["06:45", "08:20", "10:00", "11:40", "13:20", "15:00", "16:40"],
                departuresB: ["05:45", "07:30", "09:10", "10:50", "12:10", "14:10", "15:50", "17:30"],
                note: { en: "Alternative timetable variant", fr: "Variante horaire alternative", ar: "جدول مواعيد بديل" }
            },
            {
                id: "L18",
                code: { en: "LINE L18", fr: "LIGNE L18", ar: "الخط L18" },
                terminals: {
                    en: { A: "Bachdjarab", B: "Hôpital Militaire" },
                    fr: { A: "Bachdjarab", B: "Hôpital Militaire" },
                    ar: { A: "باش جراح", B: "المستشفى العسكري" }
                },
                departuresA: ["05:40", "06:20", "07:20", "08:00", "09:10", "09:50", "10:50", "11:30", "12:10", "12:50", "13:40", "14:20", "15:20", "16:00", "17:00", "17:40"],
                departuresB: ["06:30", "07:10", "08:20", "09:00", "10:00", "10:40", "11:30", "12:10", "12:50", "13:30", "14:30", "15:10", "16:10", "16:50", "17:50", "18:30"],
                note: null
            },
            {
                id: "L33",
                code: { en: "LINE L33", fr: "LIGNE L33", ar: "الخط L33" },
                terminals: {
                    en: { A: "Place Audin", B: "Station Intermodale de Kouba" },
                    fr: { A: "Place Audin", B: "Station Intermodale de Kouba" },
                    ar: { A: "ساحة أودان", B: "محطة القبة متعددة الأنواط" }
                },
                departuresA: ["05:40", "06:20", "07:20", "08:00", "09:10", "09:50", "10:50", "11:30", "12:10", "12:50", "13:40", "14:20", "15:20", "16:00", "17:00", "17:40"],
                departuresB: ["06:30", "07:10", "08:20", "09:00", "10:00", "10:40", "11:30", "12:10", "12:50", "13:30", "14:30", "15:10", "16:10", "16:50", "17:50", "18:30"],
                note: null
            },
            {
                id: "L82",
                code: { en: "LINE L82", fr: "LIGNE L82", ar: "الخط L82" },
                terminals: {
                    en: { A: "El Harrach", B: "Station Intermodale de Kouba" },
                    fr: { A: "El Harrach", B: "Station Intermodale de Kouba" },
                    ar: { A: "الحراش", B: "محطة القبة متعددة الأنواط" }
                },
                departuresA: ["06:00", "06:40", "08:00", "08:40", "10:10", "10:50", "12:10", "12:50", "13:50", "14:30", "15:50", "16:30", "17:50", "18:30"],
                departuresB: ["06:50", "07:30", "09:10", "09:50", "11:10", "11:50", "13:00", "13:40", "14:50", "15:30", "16:50", "17:30"],
                note: null
            }
        ];


  var L = { ar: 'ar', fr: 'fr', en: 'en' };
  var extra = {
    en: { cardCous: 'COUS Student Transport', btnCous: 'View Schedules', cardEtusa: 'ETUSA Public Transit', btnEtusa: 'View Lines', close: 'Close', head: 'Bus schedules', single: 'Single departure' },
    fr: { cardCous: 'Transport étudiant COUS', btnCous: 'Voir les horaires', cardEtusa: 'Transport public ETUSA', btnEtusa: 'Voir les lignes', close: 'Fermer', head: 'Horaires des bus', single: 'Départ unique' },
    ar: { cardCous: 'النقل الجامعي COUS', btnCous: 'عرض المواعيد', cardEtusa: 'النقل العمومي ETUSA', btnEtusa: 'عرض الخطوط', close: 'إغلاق', head: 'مواقيت الحافلات', single: 'انطلاق واحد' }
  };
  var st = { lang: 'fr', op: 'cous', q: '', line: 'ALL' };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function T() { var t = translations[st.lang], e = extra[st.lang]; var o = {}; for (var k in t) o[k] = t[k]; for (k in e) o[k] = e[k]; return o; }
  function hit(arr) { var q = st.q.toLowerCase().trim(); if (!q) return true; return arr.some(function (s) { return String(s).toLowerCase().indexOf(q) >= 0; }); }

  var css = '.th-wrap{font-family:Inter,system-ui,sans-serif;margin:0 0 20px}.th-wrap[dir=rtl],.th-modal[dir=rtl]{font-family:Cairo,Tajawal,sans-serif}' +
    '.th-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}@media(max-width:640px){.th-grid{grid-template-columns:1fr}}' +
    '.th-card{background:#1E1E1E;color:#f1f5f9;border:1px solid #2c2c2e;border-radius:20px;padding:22px;cursor:pointer;text-align:start;display:flex;flex-direction:column;gap:12px;transition:transform .2s,border-color .2s;font:inherit}' +
    '.th-card:hover{transform:translateY(-2px);border-color:#FF5722}.th-badge{align-self:flex-start;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#FF5722;background:rgba(255,87,34,.14);border:1px solid rgba(255,87,34,.35);padding:4px 10px;border-radius:999px}' +
    '.th-card h3{margin:0;font-size:20px;font-weight:900;color:#fff}.th-card p{margin:0;font-size:13px;line-height:1.55;color:#a1a1aa}' +
    '.th-btn{align-self:flex-start;background:#FF5722;color:#fff;border:0;border-radius:12px;padding:10px 16px;font-weight:800;font-size:13px}' +
    '.th-modal{position:fixed;inset:0;z-index:9999;background:#121212;color:#f1f5f9;display:flex;flex-direction:column;font-family:Inter,system-ui,sans-serif}' +
    '.th-top{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid #2c2c2e}.th-top h2{margin:0;flex:1;font-size:18px;font-weight:900;color:#fff}' +
    '.th-seg{display:flex;background:#1E1E1E;border:1px solid #2c2c2e;border-radius:12px;padding:3px}.th-seg button{background:none;border:0;color:#a1a1aa;font:inherit;font-weight:800;font-size:12px;padding:7px 11px;border-radius:9px;cursor:pointer;min-height:34px}.th-seg button.on{background:#FF5722;color:#fff}' +
    '.th-x{background:#1E1E1E;border:1px solid #2c2c2e;color:#fff;border-radius:12px;width:40px;height:40px;font-size:20px;cursor:pointer}' +
    '.th-body{flex:1;overflow:auto;padding:18px;max-width:960px;width:100%;margin:0 auto;box-sizing:border-box}' +
    '.th-search{width:100%;box-sizing:border-box;background:#1E1E1E;border:1px solid #2c2c2e;color:#fff;border-radius:14px;padding:12px 14px;font:inherit;font-size:14px;margin-bottom:14px;outline:none}.th-search:focus{border-color:#FF5722}' +
    '.th-h{font-size:12px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:#FF5722;margin:18px 0 10px}' +
    '.th-row{background:#1E1E1E;border:1px solid #2c2c2e;border-radius:16px;padding:14px;margin-bottom:10px;display:flex;gap:14px;align-items:flex-start}' +
    '.th-time{font-size:22px;font-weight:900;color:#fff;min-width:74px;font-variant-numeric:tabular-nums}.th-time small{display:block;font-size:11px;color:#FF5722;font-weight:700}' +
    '.th-tags{display:flex;flex-wrap:wrap;gap:6px}.th-tag{font-size:12px;font-weight:700;background:#282828;border:1px solid #2c2c2e;color:#e4e4e7;padding:4px 9px;border-radius:999px}' +
    '.th-pills{display:flex;gap:8px;overflow-x:auto;margin-bottom:14px;padding-bottom:2px}.th-pill{flex:none;background:#1E1E1E;border:1px solid #2c2c2e;color:#a1a1aa;font:inherit;font-weight:800;font-size:12px;padding:8px 14px;border-radius:12px;cursor:pointer}.th-pill.on{background:#FF5722;border-color:#FF5722;color:#fff}' +
    '.th-line{background:#1E1E1E;border:1px solid #2c2c2e;border-radius:18px;margin-bottom:14px;overflow:hidden}.th-lh{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;padding:12px 14px;background:#282828;border-bottom:1px solid #2c2c2e}' +
    '.th-code{background:#FF5722;color:#fff;font-weight:900;font-size:12px;padding:5px 10px;border-radius:10px}.th-note{font-size:11px;color:#fcd34d;margin-inline-start:6px}.th-dirs{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:14px}@media(max-width:640px){.th-dirs{grid-template-columns:1fr}}' +
    '.th-dir b{display:block;font-size:12px;color:#e4e4e7;margin-bottom:8px}.th-chips{display:flex;flex-wrap:wrap;gap:6px}.th-chip{font-size:12px;font-weight:700;font-variant-numeric:tabular-nums;background:#121212;border:1px solid #3f3f46;color:#fff;padding:4px 8px;border-radius:8px}' +
    '.th-empty{text-align:center;color:#a1a1aa;padding:40px 10px}';

  function cards(el) {
    var t = T();
    el.setAttribute('dir', st.lang === 'ar' ? 'rtl' : 'ltr');
    el.innerHTML = '<div class="th-grid">' +
      '<button type="button" class="th-card" data-op="cous"><span class="th-badge">' + esc(t.cousBadge) + '</span><h3>' + esc(t.cardCous) + '</h3><p>' + esc(t.cousCardDesc) + '</p><span class="th-btn">' + esc(t.btnCous) + ' →</span></button>' +
      '<button type="button" class="th-card" data-op="etusa"><span class="th-badge">' + esc(t.etusaBadge) + '</span><h3>' + esc(t.cardEtusa) + '</h3><p>' + esc(t.etusaCardDesc) + '</p><span class="th-btn">' + esc(t.btnEtusa) + ' →</span></button></div>';
    el.querySelectorAll('.th-card').forEach(function (b) { b.onclick = function () { open(b.getAttribute('data-op')); }; });
  }

  function cousHtml(t) {
    var l = st.lang, h = '', n = 0;
    var fx = cousFixedData.filter(function (r) { return hit(r.destinations[l].concat(r.destinations.en, [r.time])); });
    var cn = cousContinuousData.filter(function (r) { return hit(r.destinations[l].concat(r.destinations.en, [r.window])); });
    if (fx.length) { h += '<div class="th-h">' + esc(t.lblFixedHeader) + '</div>'; fx.forEach(function (r) { n++; h += '<div class="th-row"><div class="th-time">' + r.time + '<small>' + esc(r.frequency[l]) + '</small></div><div class="th-tags">' + r.destinations[l].map(function (d) { return '<span class="th-tag">' + esc(d) + '</span>'; }).join('') + '</div></div>'; }); }
    if (cn.length) { h += '<div class="th-h">' + esc(t.lblContinuousHeader) + '</div>'; cn.forEach(function (r) { n++; h += '<div class="th-row"><div class="th-time" dir="ltr" style="font-size:16px;min-width:120px">' + r.window + '<small>' + esc(t.continuousLoopBadge) + '</small></div><div class="th-tags">' + r.destinations[l].map(function (d) { return '<span class="th-tag">' + esc(d) + '</span>'; }).join('') + '</div></div>'; }); }
    return n ? h : '';
  }
  function etusaHtml(t) {
    var l = st.lang, ids = ['ALL', '189', 'L06', 'L18', 'L33', 'L82'];
    var pills = '<div class="th-pills">' + ids.map(function (id) { return '<button type="button" class="th-pill' + (st.line === id ? ' on' : '') + '" data-line="' + id + '">' + (id === 'ALL' ? esc(t.filterAll) : esc(t.filterLineWord) + ' ' + id) + '</button>'; }).join('') + '</div>';
    var body = etusaLinesData.filter(function (x) {
      if (st.line !== 'ALL' && x.id.indexOf(st.line) !== 0) return false;
      var tm = x.terminals[l], te = x.terminals.en;
      return hit([x.id, x.code[l], tm.A, tm.B, te.A, te.B]);
    }).map(function (x) {
      var tm = x.terminals[l];
      function dir(from, to, arr) { return '<div class="th-dir"><b>' + esc(from) + ' → ' + esc(to) + '</b><div class="th-chips">' + arr.map(function (d) { return '<span class="th-chip">' + d + '</span>'; }).join('') + '</div></div>'; }
      return '<div class="th-line"><div class="th-lh"><span><span class="th-code">' + esc(x.code[l]) + '</span>' + (x.note ? '<span class="th-note">' + esc(x.note[l]) + '</span>' : '') + '</span><span style="font-size:12px;font-weight:800;color:#d4d4d8">' + esc(tm.A) + ' ↔ ' + esc(tm.B) + '</span></div><div class="th-dirs">' + dir(tm.A, tm.B, x.departuresA) + dir(tm.B, tm.A, x.departuresB) + '</div></div>';
    }).join('');
    return { pills: pills, body: body };
  }

  var modal = null;
  function render() {
    if (!modal) return;
    var t = T();
    modal.setAttribute('dir', st.lang === 'ar' ? 'rtl' : 'ltr');
    modal.setAttribute('lang', st.lang);
    var title = st.op === 'cous' ? t.cardCous : t.cardEtusa;
    var langs = [['ar', 'عربي'], ['fr', 'FR'], ['en', 'EN']];
    modal.querySelector('.th-top').innerHTML = '<h2>' + esc(title) + '</h2><div class="th-seg">' + langs.map(function (x) { return '<button type="button" data-lang="' + x[0] + '" class="' + (st.lang === x[0] ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div><button type="button" class="th-x" aria-label="' + esc(t.close) + '">×</button>';
    var inp = modal.querySelector('.th-search'); inp.placeholder = t.searchPlaceholder;
    var res = modal.querySelector('.th-res'), html;
    if (st.op === 'cous') { html = cousHtml(t); modal.querySelector('.th-pbox').innerHTML = ''; }
    else { var e = etusaHtml(t); modal.querySelector('.th-pbox').innerHTML = e.pills; html = e.body; }
    res.innerHTML = html || '<div class="th-empty"><b>' + esc(t.emptyTitle) + '</b><br>' + esc(t.emptyDesc) + '</div>';
    modal.querySelectorAll('[data-lang]').forEach(function (b) { b.onclick = function () { st.lang = b.getAttribute('data-lang'); render(); }; });
    modal.querySelectorAll('[data-line]').forEach(function (b) { b.onclick = function () { st.line = b.getAttribute('data-line'); render(); }; });
    modal.querySelector('.th-x').onclick = close;
  }
  function open(op) {
    st.op = op; st.q = ''; st.line = 'ALL';
    modal = document.createElement('div'); modal.className = 'th-modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = '<div class="th-top"></div><div class="th-body"><input class="th-search" type="search"/><div class="th-pbox"></div><div class="th-res"></div></div>';
    document.body.appendChild(modal); document.body.style.overflow = 'hidden';
    var inp = modal.querySelector('.th-search'); inp.oninput = function () { st.q = inp.value; render(); };
    render();
    document.addEventListener('keydown', esck);
  }
  function esck(e) { if (e.key === 'Escape') close(); }
  function close() { if (modal) { modal.remove(); modal = null; document.body.style.overflow = ''; document.removeEventListener('keydown', esck); } }

  var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
  function scan() {
    document.querySelectorAll('[data-transport-hub]').forEach(function (el) {
      var lg = L[el.getAttribute('data-lang')] || 'fr';
      if (el.getAttribute('data-done') === lg) return;
      st.lang = lg; el.setAttribute('data-done', lg); cards(el);
    });
  }
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState !== 'loading') scan(); else document.addEventListener('DOMContentLoaded', scan);
})();
