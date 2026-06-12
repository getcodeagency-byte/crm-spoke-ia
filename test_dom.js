const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Load HTML
const htmlPath = path.join(__dirname, 'frontend', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Strip external links and scripts that would fail and delay DOMContentLoaded
html = html.replace(/<link[^>]*href="http[^"]*"[^>]*>/gi, '');
html = html.replace(/<script[^>]*src="http[^"]*"[^>]*><\/script>/gi, '');
html = html.replace(/<script[^>]*src="[^"]*widget-loader\.js"[^>]*><\/script>/gi, '');
html = html.replace(/<script[^>]*src="[^"]*app\.js"[^>]*><\/script>/gi, '');

// We need mock sessionStorage for the scripts to run
const dom = new JSDOM(html, {
    runScripts: "dangerously",
    resources: "usable",
    url: "http://localhost:3000/"
});

// Setup mock sessionStorage
dom.window.sessionStorage.setItem('spoke_agent', JSON.stringify({
    uuid: 'advisor-vendedora-uuid',
    name: 'Vendedora Test',
    avatar: ''
}));

// Setup mock Supabase
dom.window.supabase = {
    createClient: () => {
        return {
            auth: {
                onAuthStateChange: () => {},
                updateUser: async () => ({ error: null }),
                resetPasswordForEmail: async () => ({ error: null }),
            },
            from: () => ({
                insert: async () => ({ data: [], error: null }),
                select: () => ({
                    order: async () => ({ data: [], error: null })
                })
            }),
            storage: {
                from: () => ({
                    getPublicUrl: () => ({ data: { publicUrl: 'mockUrl' } })
                })
            }
        };
    }
};

// Load JS script in the DOM context
const jsPath = path.join(__dirname, 'frontend', 'js', 'app.js');
let jsContent = fs.readFileSync(jsPath, 'utf8');

// Run the script in JSDOM context
const scriptElement = dom.window.document.createElement('script');
scriptElement.textContent = jsContent;
dom.window.document.body.appendChild(scriptElement);

dom.window.document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded in JSDOM!");
});

setTimeout(() => {
    const document = dom.window.document;
    const chatMessageForm = document.getElementById('chat-message-form');
    const filterAllLeadsBtn = document.getElementById('inbox-filter-all-leads');
    const filterMyLeadsBtn = document.getElementById('inbox-filter-my-leads');
    const tagFilterInbox = document.getElementById('inbox-tag-filter');
    const quickFilterBtns = document.querySelectorAll('.inbox-filter-btn');

    const checkFormVisibility = (prefix) => {
        console.log(`${prefix} - Form hidden class:`, chatMessageForm.classList.contains('hidden'));
        console.log(`${prefix} - Form current style display:`, chatMessageForm.style.display);
    };

    // 1. Scenario: Segment filter is "Todos"
    console.log("\n================ SCENARIO 1: Segment Filter = Todos ================");
    filterAllLeadsBtn.click();
    
    let convoCards = document.querySelectorAll('.convo-card');
    convoCards.forEach(card => {
        const name = card.querySelector('.convo-name').textContent;
        console.log(`Selecting lead: ${name}`);
        card.click();
        checkFormVisibility(`Lead: ${name}`);
    });

    // 2. Scenario: Tag Filter is "Seguimiento"
    console.log("\n================ SCENARIO 2: Tag Filter = Seguimiento ================");
    if (tagFilterInbox) {
        tagFilterInbox.value = 'Seguimiento';
        const event = new dom.window.Event('change', { bubbles: true });
        tagFilterInbox.dispatchEvent(event);
        
        convoCards = document.querySelectorAll('.convo-card');
        convoCards.forEach(card => {
            const name = card.querySelector('.convo-name').textContent;
            console.log(`Selecting lead under Seguimiento: ${name}`);
            card.click();
            checkFormVisibility(`Lead: ${name}`);
        });
    }

    // 3. Scenario: Tag Filter is "all" (Todos)
    console.log("\n================ SCENARIO 3: Tag Filter = all (Todas) ================");
    if (tagFilterInbox) {
        tagFilterInbox.value = 'all';
        const event = new dom.window.Event('change', { bubbles: true });
        tagFilterInbox.dispatchEvent(event);
        
        convoCards = document.querySelectorAll('.convo-card');
        convoCards.forEach(card => {
            const name = card.querySelector('.convo-name').textContent;
            console.log(`Selecting lead under tag "all": ${name}`);
            card.click();
            checkFormVisibility(`Lead: ${name}`);
        });
    }

}, 1000);
