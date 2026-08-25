# Collaudo (UAT) — Fase 1

Prima di dichiarare chiuso l'MVP, fate provare il gestionale a chi lo userà
davvero. L'obiettivo **non** è trovare bug tecnici: è capire se il gestionale
rispecchia come lavorate.

**Come usarla:** ogni persona prova le voci del proprio ruolo con **dati veri**,
e annota cosa non torna nella **💬 Bacheca feedback** del cruscotto.

---

## Admin

- [ ] Accedo e cambio la password (🔑)
- [ ] Creo un account per ogni persona del team, con il ruolo giusto
- [ ] Inserisco nel catalogo i servizi che vendiamo davvero, con i prezzi giusti
- [ ] Le **categorie** dei servizi coprono quello che facciamo (Distribuzione,
      Management, Advertising & Promo, Pitch & PR, Live, Branding)?
- [ ] Inserisco gli artisti già a contratto
- [ ] Creo un piano di delivery reale e le sue fasi
- [ ] I **dipartimenti** corrispondono ai nostri reparti?
- [ ] Vedo i lead e le vendite di tutti i venditori
- [ ] I numeri del cruscotto (incassi, KPI) tornano con quelli che ho a mano

## Venditore (Sales)

- [ ] Accedo e cambio la password
- [ ] Inserisco un lead vero con fonte e valore stimato
- [ ] Lo sposto lungo la pipeline trascinandolo
- [ ] Le **colonne** della pipeline rispecchiano come lavoriamo davvero?
- [ ] Registro una vendita e la vedo comparire negli incassi
- [ ] Vedo i **miei** KPI
- [ ] **Non** vedo i lead dei colleghi (deve essere così)

## Operatore (produzione, grafica, video, foto, SMM)

- [ ] Accedo e cambio la password
- [ ] Vedo i task assegnati a me
- [ ] Sposto un task tra le colonne
- [ ] Aggiorno l'avanzamento di una fase di delivery
- [ ] Apro un ticket verso un altro dipartimento e ricevo risposta
- [ ] Carico un file nella cartella del mio reparto
- [ ] Gli **stati dei task** (Da fare / In corso / In revisione / Completato)
      corrispondono al nostro flusso?

## Artista

- [ ] Accedo e finisco nel portale (non nel cruscotto)
- [ ] Vedo l'avanzamento dei servizi che ho acquistato
- [ ] Vedo le mie uscite e scarico il mio materiale
- [ ] **Non** vedo altri artisti né i numeri dell'agenzia
- [ ] Quello che vedo è **chiaro**? Manca qualcosa che vorrei sapere?

---

## Le tre domande che contano

Dopo una settimana d'uso, rispondete a queste — valgono più di ogni checklist:

1. **Cosa fate ancora fuori dal gestionale** (su WhatsApp, sui fogli, a voce)?
2. **Cosa vi rallenta** rispetto a prima?
3. **Cosa manca** per smettere davvero di usare gli strumenti vecchi?

Le risposte definiscono le priorità della Fase 2, molto meglio della roadmap
scritta a tavolino.

---

## Limiti noti (già sappiamo che mancano)

Non serve segnalarli, sono già in lista:

- **Recupero password** dimenticata (ora la ricrea l'admin)
- **File online**: sul piano gratuito si perdono al riavvio (serve S3/R2)
- **Mappa live geolocalizzata** — prevista allo Sprint 9
- **Automazione**: assegnazione automatica task, reminder scadenze,
  penalità sui ritardi — previste agli Sprint 7 e 8
- **Import massivo** dei dati esistenti: al momento si inserisce a mano
