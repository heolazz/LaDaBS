import EventBus from '../game/EventBus';

/**
 * GameState — Simple flat state tracker untuk flags game
 * Tidak pakai Redux/Zustand supaya simple
 */
export const GameState = {
    flags: {
        bedroom_hp_read: false,
        bedroom_note_read: false,
        street_aira_met: false,
        school_window_seen: false,
        school_pen_borrowed: false,
        current_objective: 'Mulai hari terakhir...'
    },

    set(key, value) {
        this.flags[key] = value;
    },

    get(key) {
        return this.flags[key];
    },

    setObjective(text) {
        this.flags.current_objective = text;
        EventBus.emit('update-objective', text);
    },

    /** Cek apakah boleh pindah scene */
    canLeaveScene(sceneName) {
        const requirements = {
            BedroomScene: ['bedroom_hp_read'],
            StreetScene: ['street_aira_met'],
            SchoolScene: ['school_window_seen']
        };
        const reqs = requirements[sceneName] || [];
        return reqs.every(flag => this.flags[flag]);
    },

    /** Reset untuk new game */
    reset() {
        Object.keys(this.flags).forEach(key => {
            if (typeof this.flags[key] === 'boolean') this.flags[key] = false;
        });
        this.flags.current_objective = 'Mulai hari terakhir...';
    }
};
