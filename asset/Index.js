function MailClipboard() {
    document.getElementById('MailCopyClipBoard').addEventListener('click', async (e) => {
        e.preventDefault();
        await navigator.clipboard.writeText("mathisd.contact@pm.me");
        alert("Copied to Clipboard"); //TM
    });
}

MailClipboard();