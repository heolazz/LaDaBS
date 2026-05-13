/**
 * =========================================================
 * 📜 EPISODE 0: LAST DAY (FIRST RUN)
 * =========================================================
 * Format dukungan baru:
 * - text: string (dialog biasa)
 * - speaker: 'MC (inner)', 'Aira', null
 * - action: 'pause', 'play_sfx', 'cut_to_white', 'next_scene'
 * - duration: ms (untuk pause)
 * - choices: array [{ label, next }]
 */

export const DIALOGS = {

    EPISODE_0: {

        // 🎬 SCENE 0 — BLACK SCREEN
        scene_0_black_screen: [
            { action: 'play_sfx', sound: 'train_distant' },
            { speaker: 'MC (inner)', portrait: null, text: 'Kalau saja...' },
            { speaker: 'MC (inner)', portrait: null, text: 'aku ngomong hari itu.' },
            { action: 'pause', duration: 2000 },
            { speaker: 'MC (inner)', portrait: null, text: 'Apa semuanya akan berbeda?' },
            { action: 'play_sfx', sound: 'train_loud_cut' }
        ],

        // 🎬 SCENE 1 — KAMAR (PAGI)
        scene_1_kamar: [
            { action: 'play_sfx', sound: 'morning_birds_wind' },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Hari terakhir.' },
            { action: 'pause', duration: 1500 },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Harusnya terasa beda.' },
            { action: 'pause', duration: 2500 },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Tapi... semuanya masih sama.' },
            { action: 'pause', duration: 1500 },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Atau mungkin...' },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'aku yang berpura-pura biasa saja.' },
            {
                choices: [
                    { label: '"Hari ini aku harus ngomong."', next: 'scene_1_choice_A' },
                    { label: '"Jalani aja dulu."', next: 'scene_1_choice_B' }
                ]
            }
        ],
        scene_1_choice_A: [
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Hari ini... aku nggak boleh gagal lagi.' },
            { action: 'next_scene', target: 'scene_1_end' }
        ],
        scene_1_choice_B: [
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Nggak usah dipikirin dulu.' },
            { action: 'pause', duration: 1500 },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: '...kan masih ada waktu.' },
            { action: 'next_scene', target: 'scene_1_end' }
        ],
        scene_1_end: [
            { action: 'play_sfx', sound: 'train_distant' },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: '...kan?' }
        ],

        // --- INTERAKSI KAMAR ---
        bed_interact: [
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Kasurnya masih hangat...' },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Pengen tidur lagi, tapi gak bisa.' }
        ],
        hp_notification: [
            { speaker: 'Aira 📱', portrait: 'aira_portrait', text: 'jangan telat hari ini ya' },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: '(ada yang aneh dari kalimat ini... tapi apa?)' }
        ],
        catatan_sekolah: [
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Catatan UAS terakhir.' },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Padahal nulis ini susah banget waktu itu...' },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'sekarang malah gak ada artinya.' }
        ],

        // 🎬 SCENE 2 — JALAN REL KERETA (PAGI)
        scene_2_street: [
            { action: 'play_sfx', sound: 'wind_sakura_tracks' },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Jalan ini... selalu sama.' },
            { action: 'pause', duration: 1500 },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Tapi kenapa hari ini terasa lebih...' },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: '...sepi?' },
            { action: 'spawn_character', character: 'aira' },
            { speaker: 'Aira', portrait: 'aira_portrait', text: 'Eh?' },
            { action: 'pause', duration: 1000 },
            { speaker: 'Aira', portrait: 'aira_portrait', text: 'Pagi.' },
            {
                choices: [
                    { label: '"Pagi."', next: 'scene_2_choice_2A' },
                    { label: '"Tumben bareng."', next: 'scene_2_choice_2B' }
                ]
            }
        ],
        scene_2_choice_2A: [
            { speaker: 'Aira', portrait: 'aira_portrait', text: 'Kamu keliatan... beda hari ini.' },
            { action: 'next_scene', target: 'scene_2_mid' }
        ],
        scene_2_choice_2B: [
            { speaker: 'Aira', portrait: 'aira_portrait', text: 'Iya... jarang ya ketemu di sini.' },
            { action: 'pause', duration: 2000 },
            { action: 'next_scene', target: 'scene_2_mid' }
        ],
        scene_2_mid: [
            { action: 'play_sfx', sound: 'sakura_falling_between' },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Harusnya aku ngomong sesuatu.' },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Sesuatu yang penting.' },
            {
                choices: [
                    { label: '"Hari ini... kamu sibuk?"', next: 'scene_2_choice_3A' },
                    { label: '"Nanti... ada waktu?"', next: 'scene_2_choice_3B' }
                ]
            }
        ],
        scene_2_choice_3A: [
            { speaker: 'Aira', portrait: 'aira_portrait', text: 'Hari terakhir loh.' },
            { speaker: 'Aira', portrait: 'aira_portrait', text: 'Semua orang pasti sibuk.' },
            { action: 'next_scene', target: 'scene_2_end' }
        ],
        scene_2_choice_3B: [
            { speaker: 'Aira', portrait: 'aira_portrait', text: 'Hmm?' },
            { action: 'pause', duration: 1500 },
            { speaker: 'Aira', portrait: 'aira_portrait', text: 'Kenapa?' },
            { speaker: 'MC', portrait: 'mc_portrait', text: 'Nggak... cuma nanya.' },
            { action: 'next_scene', target: 'scene_2_end' }
        ],
        scene_2_end: [
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Kenapa aku selalu berhenti di situ?' },
            { action: 'play_sfx', sound: 'train_loud_passing' },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Seperti selalu ada yang menghalangi.' }
        ],

        // 🎬 SCENE 3 — KELAS (SIANG)
        scene_3_kelas: [
            { action: 'play_sfx', sound: 'class_ambient_distant' },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Kelas ini...' },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Besok sudah bukan milik kita lagi.' },
            { speaker: 'Aira', portrait: 'aira_portrait', text: 'Kamu dari tadi diem aja.' },
            {
                choices: [
                    { label: '"Lagi mikir."', next: 'scene_3_choice_4A' },
                    { label: '"Nggak tau harus ngomong apa."', next: 'scene_3_choice_4B' }
                ]
            }
        ],
        scene_3_choice_4A: [
            { speaker: 'Aira', portrait: 'aira_portrait', text: 'Berat banget ya mikirnya.' },
            { action: 'next_scene', target: 'scene_3_end' }
        ],
        scene_3_choice_4B: [
            { speaker: 'Aira', portrait: 'aira_portrait', text: '...itu jarang.' },
            { action: 'pause', duration: 1500 },
            { speaker: 'Aira', portrait: 'aira_portrait', text: 'Kamu biasanya lebih santai.' },
            { action: 'next_scene', target: 'scene_3_end' }
        ],
        scene_3_end: [
            { action: 'pause', duration: 3000 },
            { action: 'play_sfx', sound: 'window_wind' },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Waktu terus jalan.' },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Tanpa nunggu aku siap.' }
        ],

        // ============================================
        // 🎬 SCENE 4 — KORIDOR SORE (PERPISAHAN)
        // ============================================
        scene_4_sore: [
            { action: 'play_sfx', sound: 'evening_wind_footsteps' },
            { speaker: 'Aira', portrait: 'aira_portrait', text: 'Aku duluan ya.' },
            { action: 'pause', duration: 1500 },
            { speaker: 'Aira', portrait: 'aira_portrait', text: 'Sampai nanti.' },
            { action: 'character_walk_away', character: 'aira' },
            { action: 'pause', duration: 2000 },
            {
                choices: [
                    { label: '"Tunggu...!"', next: 'scene_4_choice_A' },
                    { label: '(Diam)', next: 'scene_4_choice_B' }
                ]
            }
        ],

        // ---- PATH A: "Tunggu...!" ----
        scene_4_choice_A: [
            { speaker: 'MC', portrait: 'mc_portrait', text: 'Tunggu—' },
            { action: 'pause', duration: 3000 },
            { speaker: 'MC', portrait: 'mc_portrait', text: '...' },
            { speaker: 'MC', portrait: 'mc_portrait', text: '...' },
            { action: 'character_turn_back', character: 'aira' },
            { speaker: 'Aira', portrait: 'aira_portrait', text: 'Iya?' },
            {
                choices: [
                    { label: '"Aku..."', next: 'scene_4_micro_A' },
                    { label: '"Nggak jadi..."', next: 'scene_4_micro_B' }
                ],
                isMicroChoice: true
            }
        ],
        scene_4_micro_A: [
            { speaker: 'MC', portrait: 'mc_portrait', text: 'Aku...' },
            { action: 'pause', duration: 1500 },
            { speaker: 'MC', portrait: 'mc_portrait', text: '...nggak jadi.' },
            { action: 'pause', duration: 1500 },
            { speaker: 'Aira', portrait: 'aira_portrait', text: '...oh.' },
            { action: 'pause', duration: 1000 },
            { speaker: 'Aira', portrait: 'aira_portrait', text: 'Ya udah.' },
            { action: 'character_walk_away', character: 'aira' },
            { action: 'pause', duration: 2000 },
            { action: 'next_scene', target: 'scene_4_bridge' }
        ],
        scene_4_micro_B: [
            { speaker: 'MC', portrait: 'mc_portrait', text: 'Nggak jadi.' },
            { action: 'pause', duration: 1500 },
            { speaker: 'Aira', portrait: 'aira_portrait', text: 'Dasar.' },
            { action: 'character_walk_away', character: 'aira' },
            { action: 'pause', duration: 2000 },
            { action: 'next_scene', target: 'scene_4_bridge' }
        ],

        // ---- PATH B: (Diam) ----
        scene_4_choice_B: [
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Panggil dia.' },
            { action: 'pause', duration: 3000 },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Sekarang.' },
            { action: 'pause', duration: 4000 },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: '...' },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Kenapa aku diam?' },
            { action: 'pause', duration: 2000 },
            { action: 'next_scene', target: 'scene_4_bridge' }
        ],

        // ---- BRIDGE: Transisi setelah semua path gagal ----
        scene_4_bridge: [
            { action: 'play_sfx', sound: 'footsteps_fading' },
            { action: 'pause', duration: 3000 },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Dia pergi.' },
            { action: 'pause', duration: 2000 },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Dan aku masih di sini.' },
            { action: 'pause', duration: 2000 },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Bodoh.' },
        ],

        // ============================================
        // 🎬 SCENE 5 — JALAN PULANG (SENJA → MALAM)
        // ============================================
        scene_5_ending: [
            { action: 'play_sfx', sound: 'footsteps_fading_sakura' },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Tadi pagi, kereta lewat begitu cepat.' },
            { action: 'pause', duration: 2000 },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Aku pikir itu yang bikin aku gagal.' },
            { action: 'pause', duration: 2000 },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Tapi bukan.' },
            { action: 'pause', duration: 3000 },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Yang bikin aku gagal...' },
            { action: 'pause', duration: 2000 },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: '...adalah aku sendiri.' },
            { action: 'pause', duration: 3000 },
            { action: 'character_vanish', character: 'aira' },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: 'Kalau bukan hari ini...' },
            { action: 'pause', duration: 2000 },
            { speaker: 'MC (inner)', portrait: 'mc_portrait', text: '...kapan lagi?' },
            { action: 'pause', duration: 4000 },
            { action: 'play_sfx', sound: 'train_loud_emotional_peak' },
            { action: 'cut_to_white' },
            { action: 'show_final_line' }
        ]
    }
};
