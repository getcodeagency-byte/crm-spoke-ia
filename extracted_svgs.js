Created At: 2026-05-29T18:23:39Z
Completed At: 2026-05-29T18:23:39Z
File Path: `file:///Users/macbook/Desktop/Spoke%20-%20IA/frontend/js/app.js`
Total Lines: 2862
Total Bytes: 135069
Showing lines 295 to 340
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
295:             { sender: 'customer', content: 'Hola, busco un sofá compacto.', time: '11:15 AM' },
296:             { sender: 'ai', content: '¡Hola! Te recomiendo nuestro Sofá Nórdico de 3 puestos, es ideal para apartamentos pequeños y está tapizado en lino gris claro.', time: '11:16 AM' }
297:         ],
298:         'lead-2': [
299:             { sender: 'customer', content: 'Hola, ¿tienen stock de lámparas vintage?', time: 'Ayer' },
300:             { sender: 'ai', content: '¡Hola María! Sí, contamos con la Lámpara de Pie Vintage Cobre a $450,000 COP.', time: 'Ayer' }
301:         ]
302:     };
303: 
304:     const channelIcons = {
305:         whatsapp: 'fa-brands fa-whatsapp whatsapp',
306:         instagram: 'fa-brands fa-instagram instagram',
307:         tiktok: 'fa-brands fa-tiktok tiktok',
308:         webchat: 'fa-solid fa-comments webchat', // Icono Webchat cian
309:         messenger: 'fa-brands fa-facebook-messenger messenger'
310:     };
311: 
312:     const channelSVGs = {
313:         whatsapp: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj48cGF0aCBmaWxsPSIjMjVEMzY2IiBkPSJNMzgwLjkgOTcuMUMzMzkgNTUuMSAyODMuMiAzMiAyMjMuOSAzMmMtMTIyLjQgMC0yMjIgOTkuNi0yMjIgMjIyIDAgMzkuMSAxMC4yIDc3LjMgMjkuNiAxMTFMMy4yIDQ5NmwxMzMuOS0zNS4xYzMyLjcgMTcuOCA2OS40IDI3LjIgMTA2LjcgMjcuMiAxMjIuNCAwIDIyMi05OS42IDIyMi0yMjIgMC01OS4zLTIzLTExNS4xLTY1LTE1Ny4xek0yMjMuOSA0NDUuNWMtMzMuMiAwLTY1LjctOC45LTk0LTI1LjdsLTYuNy00LTc5LjggMjAuOSAyMS4zLTc3LjgtNC40LTdjLTE4LjUtMjMuNC0yOC4yLTYzLjMtMjguMi05OC4yIDAtMTAxLjcgODIuOC0xODQuNS
<truncated 3779 bytes>
tMzguMzEtNi4xOWMtMy4xIDAtNi4xOC4xNy05LjI1LjV2ODEuMUEyMDkuOCAyMDkuOCAwIDAgMSA0NDggMjA5LjkxeiIvPjwvc3ZnPg==',
317:         webchat: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjMDZCNkQ0IiBkPSJNMjU2IDMyQzEyMC4xIDMyIDEyIDEyMC4xIDEyIDI1NmMwIDYwLjYgMjIgMTE2IDU4LjcgMTU4LjdMMzIgNDgwbDY1LjMtMzguN0MyNTYuNSA0NzcuMyAzNTcuOSA0NTIuMyA0MzUgMzkwLjcgNDgzLjMgMzM4IDUxMiAyOTcuNiA1MTIgMjU2IDUxMiAxMjAuMSA0MDMuOSAzMiAyNTYgMzJ6bTAgMzg0Yy05Mi44IDAtMTY4LTU3LjMtMTY4LTEyOHM3NS4yLTEyOCAxNjgtMTI4IDE2OCA1Ny4zIDE2OCAxMjgtNzUuMiAxMjgtMTY4IDEyOHoiLz48L3N2Zz4='
318:     };
319: 
320:     function getChannelSVGHTML(channel, size = '16px') {
321:         const svg = channelSVGs[channel];
322:         if (svg) {
323:             return `<img src="${svg}" alt="${channel}" class="channel-svg-icon" style="width: ${size}; height: ${size}; vertical-align: middle; display: inline-block;" />`;
324:         }
325:         return `<i class="fa-solid fa-circle"></i>`;
326:     }
327: 
328:     // ----------------------------------------------------------------------
329:     // 2. Lógica de Autenticación y Registro (Login Seguro - V3.0)
330:     // ----------------------------------------------------------------------
331:     const loginScreen = document.getElementById('login-screen');
332:     const crmLayout = document.getElementById('crm-layout');
333:     const loginForm = document.getElementById('login-form');
334:     const registerForm = document.getElementById('register-form');
335:     
336:     const loginEmailInput = document.getElementById('login-email');
337:     const loginPasswordInput = document.getElementById('login-password');
338:     const loginErrorMsg = document.getElementById('login-error-msg');
339:     
340:     const regNameInput = document.getElementById('reg-name');
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
