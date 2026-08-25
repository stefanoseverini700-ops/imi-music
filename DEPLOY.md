# Mettere online il gestionale (Render)

Guida passo-passo. Serve un account **GitHub** (già presente) e uno **Render**
(gratuito). Il database resta quello **Neon** già in uso: online e in locale
vedrete gli **stessi dati**.

---

## Prima di iniziare: due cose da sapere

**1. Il piano gratuito di Render "addormenta" i servizi.**
Dopo ~15 minuti di inattività il servizio si spegne; la prima apertura
successiva richiede 30–60 secondi. Poi va normale. Per un uso continuativo
serve il piano a pagamento.

**2. I file caricati NON sopravvivono ai riavvii.**
Il disco del piano gratuito è effimero. L'area file funziona, ma i documenti
spariscono a ogni redeploy. Finché non si attiva un disco persistente o uno
storage S3/R2, **non usate l'area file online come archivio definitivo**.

---

## Passo 1 — Prendi la stringa del database

Su **neon.tech** → il tuo progetto → **Connect** → **spegni** l'interruttore
_Connection pooling_ → copia la stringa. Deve essere **senza `-pooler`**:

```
postgresql://neondb_owner:PASSWORD@ep-xxxx.REGIONE.aws.neon.tech/neondb?sslmode=require
```

## Passo 2 — Crea i servizi su Render

1. Vai su **render.com** → **Get Started** → accedi con **GitHub**
2. Autorizza Render sul repository **imi-music**
3. **New +** → **Blueprint** → seleziona **imi-music** → **Apply**

Render legge `render.yaml` e prepara due servizi: **imi-api** e **imi-web**.

## Passo 3 — Inserisci i valori riservati

Render chiederà i valori marcati come "sync: false". Sul servizio **imi-api** →
**Environment**:

| Variabile             | Cosa metterci                                         |
| --------------------- | ----------------------------------------------------- |
| `DATABASE_URL`        | la stringa Neon del Passo 1                           |
| `SEED_ADMIN_EMAIL`    | l'email dell'amministratore (es. `stefano@…`)         |
| `SEED_ADMIN_PASSWORD` | una password robusta, **diversa** da `admin1234`      |
| `RESEND_API_KEY`      | _(facoltativa)_ per le email — lasciala vuota per ora |

> ⚠️ `SEED_ADMIN_PASSWORD` viene applicata a **ogni** avvio del servizio. Dopo il
> primo accesso conviene **svuotarla** dal pannello Render: così la password che
> imposti dall'app non viene più sovrascritta.

## Passo 4 — Aspetta il primo deploy

5–10 minuti. All'avvio l'API applica automaticamente le migrazioni del database
e crea i dipartimenti di default. **Non** inserisce dati demo.

## Passo 5 — Apri l'app

Servizio **imi-web** → in alto trovi l'indirizzo, tipo
`https://imi-web-xxxx.onrender.com`. Aprilo e accedi con l'email e la password
del Passo 3.

---

## Dopo il primo accesso

1. **Svuota `SEED_ADMIN_PASSWORD`** su Render (vedi avviso sopra)
2. Cambia la password dall'app con il pulsante **🔑**
3. Crea gli account del team (➕ Utente)
4. Passa la **[GUIDA-TEAM.md](./GUIDA-TEAM.md)** a chi lo userà

---

## Aggiornare l'app in futuro

Ogni `git push` su `main` fa ripartire il deploy da solo. Le migrazioni del
database vengono applicate all'avvio, quindi non serve fare altro.

## Se qualcosa non funziona

Su Render, servizio **imi-api** → **Logs**. Gli errori più comuni:

| Messaggio                        | Causa                                              |
| -------------------------------- | -------------------------------------------------- |
| `Can't reach database server`    | `DATABASE_URL` sbagliata, o è quella con `-pooler` |
| `password authentication failed` | password Neon errata nella stringa                 |
| Pagina bianca sul web            | l'API non è ancora partita: aspetta e ricarica     |
