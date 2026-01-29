const STORAGE_KEY = 'mojeKnihy_v1'
const STATUSES = ['Chci číst', 'Čtu', 'Dočteno']
const form = document.getElementById('zapis-knih')
const tbody = document.querySelector('#tabulka-knih tbody')
const summary = document.getElementById('shrnuti')

let books = []

function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books))
}

function load() {
    const raw = localStorage.getItem(STORAGE_KEY)
    
    if (!raw) return []
    
    try {
        const parsed = JSON.parse(raw)
        
        if (!Array.isArray(parsed)) return []

        return parsed.map(item => ({
            id: item.id || Date.now(),
            nazev: item.nazev,
            autor: item.autor,
            rok: item.rok || '—',
            stav: item.stav || STATUSES[0],
        }))
    } catch (e) {
        console.error('Chyba při načítání dat z localStorage', e)
        return []
    }
}

function render() {
    tbody.innerHTML = ''

    if (!books.length) {
        const empty = document.createElement('tr')
        const cell = document.createElement('td')
        cell.colSpan = 5
        cell.textContent = 'Zatím žádné knihy.'
        cell.className = 'muted'
        empty.appendChild(cell)
        tbody.appendChild(empty)
    }

    books.forEach((kniha, idx) => {
        const tr = document.createElement('tr')

        const tdNazev = document.createElement('td')
        tdNazev.textContent = kniha.nazev
        
        const tdAutor = document.createElement('td')
        tdAutor.textContent = kniha.autor

        const tdRok = document.createElement('td')
        tdRok.textContent = kniha.rok || '—'

        const tdStav = document.createElement('td')
        const select = document.createElement('select')
        
        STATUSES.forEach(stav => {
            const option = document.createElement('option')
            option.value = stav
            option.textContent = stav
            
            if (kniha.stav === stav) option.selected = true
            select.appendChild(option)
        })
        
        select.addEventListener('change', () => {
            books[idx].stav = select.value
            save()
            render()
        })
        tdStav.appendChild(select)

        const tdSmazat = document.createElement('td')
        const btnSmazat = document.createElement('button')
        btnSmazat.textContent = 'Smazat'
        btnSmazat.className = 'action danger'
        
        btnSmazat.addEventListener('click', () => {
            if (confirm(`Opravdu smazat knihu "${kniha.nazev}"?`)) {
                books.splice(idx, 1)
                save()
                render()
            }
        })
        tdSmazat.appendChild(btnSmazat)

        tr.appendChild(tdNazev)
        tr.appendChild(tdAutor)
        tr.appendChild(tdRok)
        tr.appendChild(tdStav)
        tr.appendChild(tdSmazat)
        
        tbody.appendChild(tr)
    })

    if (summary) {
        const total = books.length
        const done = books.filter(k => k.stav === 'Dočteno').length
        summary.textContent = total ? `${done}/${total} dočteno` : 'Nic k zobrazení'
    }
}

books = load()
render()

form.addEventListener('submit', (e) => {
    e.preventDefault()
    
    const nazev = form.titulek.value.trim()
    const autor = form.autor.value.trim()
    const rok = form.rok.value.trim()
    const stav = form.stav.value

    if (!nazev || !autor) return

    books.push({
        id: Date.now(),
        nazev,
        autor,
        rok: rok || '—',
        stav,
    })
    
    save()
    render()
    form.reset()
})
