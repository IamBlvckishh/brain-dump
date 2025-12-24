document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('tiles-grid');
    const modal = document.getElementById('note-modal');
    const addBtn = document.getElementById('add-note-btn');
    const saveBtn = document.getElementById('save-note');
    const closeBtn = document.getElementById('close-modal');
    const privacyBtn = document.getElementById('privacy-btn');
    const exportBtn = document.getElementById('export-btn');
    
    let notes = JSON.parse(localStorage.getItem('brain_dump_v1')) || [];
    let isCloaked = false;

    const render = (filter = 'all') => {
        grid.innerHTML = '';
        const data = filter === 'all' ? notes : notes.filter(n => n.energy === filter);

        data.forEach((note, i) => {
            const card = document.createElement('div');
            card.className = `note-tile ${isCloaked ? 'privacy-on' : ''}`;
            const color = note.energy === 'high' ? 'var(--high)' : note.energy === 'med' ? 'var(--med)' : 'var(--low)';
            card.style.borderColor = color;
            card.style.boxShadow = `10px 10px 0px ${color}`;

            card.innerHTML = `
                <div class="tile-head">
                    <span class="energy-pill" style="background:${color}">${note.energy.toUpperCase()}</span>
                    <div class="tile-actions">
                        <span class="share-btn" onclick="shareNote(${i})" title="Send to Phone">📤</span>
                        <span class="del-btn" onclick="deleteNote(${i})" title="Delete">×</span>
                    </div>
                </div>
                <div class="note-content">${note.text}</div>
                <div style="font-size:0.6rem; opacity:0.5; font-weight:bold;">CAPTURED: ${note.date}</div>
            `;
            grid.appendChild(card);
        });
    };

    const updateStorage = () => {
        localStorage.setItem('brain_dump_v1', JSON.stringify(notes));
        render();
    };

    // Modal logic
    addBtn.onclick = () => modal.classList.remove('hidden');
    closeBtn.onclick = () => modal.classList.add('hidden');

    saveBtn.onclick = () => {
        const text = document.getElementById('note-text').value.trim();
        const energy = document.getElementById('energy-level').value;
        if (!text) return;
        notes.unshift({
            text, energy,
            date: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
        });
        document.getElementById('note-text').value = '';
        modal.classList.add('hidden');
        updateStorage();
    };

    // Global Functions
    window.deleteNote = (i) => {
        if(confirm('REMOVE THOUGHT?')) {
            notes.splice(i, 1);
            updateStorage();
        }
    };

    window.shareNote = async (i) => {
        const note = notes[i];
        try {
            if (navigator.share) {
                await navigator.share({ title: 'Brain Dump', text: note.text });
            } else {
                await navigator.clipboard.writeText(note.text);
                alert("Copied to clipboard! Paste into your notes app.");
            }
        } catch (err) { console.log(err); }
    };

    // Export .txt
    exportBtn.onclick = () => {
        if (notes.length === 0) return;
        let content = "BRAIN DUMP EXPORT\n\n";
        notes.forEach(n => {
            content += `[${n.energy.toUpperCase()}] ${n.date}\n${n.text}\n---\n\n`;
        });
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BrainDump_${new Date().toLocaleDateString()}.txt`;
        a.click();
    };

    privacyBtn.onclick = () => {
        isCloaked = !isCloaked;
        privacyBtn.innerText = isCloaked ? '🔓 REVEAL' : '👁️ CLOAK';
        render();
    };

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            render(e.target.dataset.filter);
        };
    });

    render();
});
