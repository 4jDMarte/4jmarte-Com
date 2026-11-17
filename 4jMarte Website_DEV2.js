let currentSelectedDoc = {
    title: "4jMarte Automation Engineering Proposal",
    filename: "4jMarte-Automation Engineering_Proposal.pdf",
    ref: "4JM-PROP-2026",
    src: "./4jMarte-Automation Engineering_Proposal.pdf"
};

let isAuthenticated = false;
let userEmailValue = "";

// 1. Dynamic Search by Filename, Title, Ref, or Keywords
function filterDocuments() {
    const input = document.getElementById('doc-search-input').value.toLowerCase().trim();
    const cards = document.querySelectorAll('.doc-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const title = card.getAttribute('data-title').toLowerCase();
        const filename = card.getAttribute('data-filename').toLowerCase();
        const ref = card.getAttribute('data-ref').toLowerCase();
        const keywords = card.getAttribute('data-keywords').toLowerCase();

        if (filename.includes(input) || title.includes(input) || ref.includes(input) || keywords.includes(input)) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    const noDocs = document.getElementById('no-docs-found');
    if (visibleCount === 0) {
        noDocs.classList.remove('hidden');
    } else {
        noDocs.classList.add('hidden');
    }
}

// 2. Document Selection Switcher
function selectDocument(element) {
    document.querySelectorAll('.doc-card').forEach(c => {
        c.classList.remove('active', 'border-brand-500/50', 'bg-slate-900/80');
        c.classList.add('border-slate-700', 'bg-slate-800/60');
    });

    element.classList.add('active', 'border-brand-500/50', 'bg-slate-900/80');
    element.classList.remove('border-slate-700', 'bg-slate-800/60');

    currentSelectedDoc.title = element.getAttribute('data-title');
    currentSelectedDoc.filename = element.getAttribute('data-filename');
    currentSelectedDoc.ref = element.getAttribute('data-ref');
    currentSelectedDoc.src = element.getAttribute('data-src');

    const pdfFrame = document.getElementById('pdf-frame');
    pdfFrame.src = `${currentSelectedDoc.src}#toolbar=0&navpanes=0`;

    if (isAuthenticated) {
        document.getElementById('pdf-header-title').textContent = currentSelectedDoc.filename;
        document.getElementById('pdf-header-subtitle').textContent = `Authorized View for: ${userEmailValue} (Ref: ${currentSelectedDoc.ref})`;
    }
}

// 3. Strict Corporate Email Validation (Blocks Fake/Dummy & Free Webmail Addresses)
function isLegitCorporateEmail(email) {
    const basicRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!basicRegex.test(email)) return { valid: false, reason: "Invalid email format. Use name.surname@company.com" };

    const [localPart, domainPart] = email.toLowerCase().split('@');
    const domainName = domainPart.split('.')[0];

    // Block placeholder / fake / dummy local names
    const blockedLocals = ['any', 'test', 'testing', 'demo', 'example', 'user', 'guest', 'none', 'null', 'fake', 'asdf', 'qwerty', '123', 'abc', 'admin', 'temp', 'no-reply', 'noreply'];
    if (blockedLocals.includes(localPart) || localPart.length < 2) {
        return { valid: false, reason: "Please enter your real name (e.g. john.smith@company.com)." };
    }

    // Block placeholder / fake domains
    const blockedDomains = ['company.com', 'companyname.com', 'example.com', 'example.org', 'test.com', 'domain.com', 'email.com', 'mail.com', 'fake.com', 'none.com', 'null.com', 'asdf.com', 'xyz.com', '123.com', 'yourcompany.com'];
    if (blockedDomains.includes(domainPart) || blockedLocals.includes(domainName)) {
        return { valid: false, reason: "Placeholder domains like @company.com are not accepted. Use your actual company domain." };
    }

    // Block public / free consumer email providers
    const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'aol.com', 'icloud.com', 'protonmail.com', 'proton.me', 'gmx.com', 'yandex.com', 'zoho.com', 'msn.com'];
    if (freeProviders.includes(domainPart)) {
        return { valid: false, reason: "Free consumer emails (Gmail, Yahoo, Outlook) are restricted. Please use your corporate work email." };
    }

    return { valid: true };
}

function verifyCorporateEmail() {
    const emailInput = document.getElementById('corporate-email-input');
    const securityMsg = document.getElementById('security-msg');
    const lockedOverlay = document.getElementById('pdf-locked-overlay');
    const pdfFrame = document.getElementById('pdf-frame');
    const downloadBtn = document.getElementById('download-doc-btn');
    const fullscreenBtn = document.getElementById('fullscreen-doc-btn');
    const securityBox = document.getElementById('doc-security-box');

    const email = emailInput.value.trim();
    const check = isLegitCorporateEmail(email);

    if (!check.valid) {
        // Re-lock if previously unlocked and user enters invalid email
        isAuthenticated = false;
        lockedOverlay.classList.remove('opacity-0', 'pointer-events-none');
        pdfFrame.classList.add('opacity-20');
        downloadBtn.classList.add('opacity-50', 'pointer-events-none');
        fullscreenBtn.classList.add('opacity-50', 'pointer-events-none');

        securityBox.className = "bg-red-950/30 border border-red-500/40 rounded-xl p-5";
        securityMsg.className = "mt-2 text-xs text-red-400 font-semibold";
        securityMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation me-1"></i> ${check.reason}`;
        emailInput.focus();
        return;
    }

    isAuthenticated = true;
    userEmailValue = email;

    lockedOverlay.classList.add('opacity-0', 'pointer-events-none');
    pdfFrame.classList.remove('opacity-20');
    
    downloadBtn.classList.remove('opacity-50', 'pointer-events-none');
    fullscreenBtn.classList.remove('opacity-50', 'pointer-events-none');

    document.getElementById('pdf-header-title').textContent = currentSelectedDoc.filename;
    document.getElementById('pdf-header-subtitle').textContent = `Authorized View for: ${email} (Ref: ${currentSelectedDoc.ref})`;
    
    securityBox.className = "bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-5";
    securityMsg.className = "mt-2 text-xs text-emerald-400 font-semibold";
    securityMsg.innerHTML = `<i class="fa-solid fa-circle-check me-1"></i> Authenticated for <strong>${email}</strong>. Download request ready.`;
}

// 4. Send Email Request directly to info@4jmarte.ie
function requestDownloadViaEmail() {
    if (!isAuthenticated) return;
    const recipient = "info@4jmarte.ie";
    const subject = encodeURIComponent(`Document Download Request: ${currentSelectedDoc.filename} [${currentSelectedDoc.ref}]`);
    const body = encodeURIComponent(
        `Hello 4jMarte Engineering Team,\n\n` +
        `An official document download request has been submitted from the web portal:\n\n` +
        `Requester Email: ${userEmailValue}\n` +
        `File Name: ${currentSelectedDoc.filename}\n` +
        `Document Title: ${currentSelectedDoc.title}\n` +
        `Document Ref: ${currentSelectedDoc.ref}\n\n` +
        `Please forward the requested PDF package to ${userEmailValue}.\n\n` +
        `Best regards,\n` +
        `${userEmailValue}`
    );

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
}

// 5. Fullscreen Preview Toggle
function toggleDocFullscreen() {
    if (!isAuthenticated) return;
    const pdfFrame = document.getElementById('pdf-frame');
    if (pdfFrame.requestFullscreen) {
        pdfFrame.requestFullscreen();
    } else if (pdfFrame.webkitRequestFullscreen) {
        pdfFrame.webkitRequestFullscreen();
    }
}