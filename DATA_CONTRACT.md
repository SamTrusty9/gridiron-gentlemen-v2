# Gridiron Gentlemen's Society — Build Contract

All builders MUST follow this contract so independently-built files fit together.
Repo root: `~/workspace/gridiron-gentlemen-v2/` (directly deployable to GitHub Pages).

## Data files (already in `data/`, already split — do NOT re-split)
meta, managers, divisions, standings, drafts, brackets, records, franchises,
rivalries, bets, newsletters, schedule, weekly, rules, fame, players
(each `<name>.json`), plus `data/lineups/<manager-id>.json` (12 files, loaded on demand).

Key shapes:
- `meta.json`: {league:{name,shortName,motto}, tradeDeadline, currentWeek2026, seasons:[2023..2026], photoMap:{managerId: "assets/photos/....jpeg"}, draftLocationPhoto, nameToId}
- `managers.json`: {managers:[{id,name,team,teamHistory[],division("I"|"II"|"III"),motto,favoriteTeam,rivalId,bio}]}
- `divisions.json`: {divisions:{"I":{name,members[],rivalries[[a,b]]},...}, divisionsData:{note,combined,matrix,withinDivision,titles}, intraDivisionRecord, divisionPowerData:{divisionRosters,periods}, rivalMap:{a:b}}
- `standings.json`: {seasonTotals:[{Season,Manager,Team Name,Record,PF,PA,PF/G,PA/G,DIFF,Div Record,Streak,...} — NOTE: includes a junk last row where Season is a long "Source:" string; FILTER to numeric Season], careerTotals:{id:{totalPF,totalPA,games,avgPF,avgPA}}, standingsTrend:{"2023":[...],...}, powerRankings:[{rank,id,y23,y24,y25,score,tier}], powerRankings2026:{asOfLabel,week,rankings:[{rank,team,managerId,prevRank,trend}]}, careerRecords:[{id,record,winpct,titles,playoffWins,champApps,top3,top5,regFirst,last}]}
- `drafts.json`: {drafts:{"2023":[{Round,Pick,"Overall Pick",Player,"NFL Team",Position,"Fantasy Team",Manager,PositionFinish,PositionDraftOrder}],...}} — 4 years × 192 picks
- `brackets.json`: {brackets:{"2023":{byes[],round1[{home:{seed,id},away,winner}],semis,final:{...}|champion},...}, championshipSummary:{"2023":{...}}, awards:{"2023":[{...}],...}, playoffRecord:[{id,apps,bracket,titles,best}]}
- `records.json`: {hofRecords:[{label,holder,detail}], hofTopTeamScores:[{rank,season,week,team,opponent,points}], hofTopPlayerPerformances:[{rank,season,week,team,player,position,points}], hofByPosition:[{position,player,season,week,points}], leagueGames:{blowouts,closest,highestScoring,lowestScoring}, benchPoints:{global[],perManager}, seasonalPFRecords:{top5,bottom5}, managerBlowouts:[[id,[{season,week,opponent,myScore,oppScore,margin,result}]]], managerClosest: same}
- `franchises.json`: {yearByYear:{id:{"2023":["12-3, 1st","1st",false],...}}, franchiseBlurbs:{id:"..."}, headToHead:{id:{otherId:{w,l,t,games,avgPf,avgPa}}}, franchiseRecords:{id:{topTeamWeeks,topPlayerPerfs,mostUsedPlayer,totalMoves,longestWinStreak,longestWinStreakSpan,longestLossStreak,longestLossStreakSpan}}}
- `rivalries.json`: {pairs:[{a,b}]} — 6 pairs. Series history: derive from franchises.headToHead (a→b record). Trophy/bet copy: grep /tmp/ggs.html for each pair's trophy text; if not found, omit gracefully.
- `bets.json`: {gambles:[{id,title,description,type,status,odds,betDate,settleBy,participants[],result}]}
- `newsletters.json`: {newsletters:[{season,week,title,date,body(HTML with nl-* classes)}]} — 6 items, oldest first
- `schedule.json`: {schedule2026:{"1":[{away,home,awayManagerId,homeManagerId}],...}, currentWeek2026:5, matchupOfWeekOverride2026}
- `weekly.json`: {weeklyScores:[{Season,Week,Team,Opponent,"Points For","Points Against",Result}]} — 708 rows
- `rules.json`: {rules:{overview:{founded,managers,format,regSeasonWeeks,playoffField,buyIn,champions}, schedule, playoffFormat, payouts, waivers, trades, draftOrder, buyInDeadline, gamblingRule, keepers}} — values may be strings or objects; render generically
- `fame.json`: {famousSelfies:[{celebrity,date,dateDisplay,location,managers[],note}], medals: same as hofByPosition}
- `players.json`: {players:[{key,name,pos,n,entries:[[managerId,season,week,position,points,starter01],...]}], count:527}
- `lineups/<id>.json`: {managerId, seasons:{"2023":{"1":{opponent,result,pf,pa,players:[{player,position,points,starter,slot}]},...}}}

## App architecture
- `index.html`: shell — header (badge img + league name + nav), `<main id="app">`, footer. Loads `css/styles.css`, then `js/lib.js`, `js/sections/*.js`, then `js/app.js`. PWA tags: manifest link, theme-color, apple-touch-icon.
- `js/lib.js`: defines `window.Lib` with helpers: esc, mgr(id), mname(id), teamName(id), photo(id)→path|null, avatar(id, sizeClass)→HTML (img or initials fallback), initials(name), fmt(n,d), divName("I")→"Division I", lineChart(series,w,h)→svg, hbars(rows)→HTML, medalColor(pos), wl(recordString)→{w,l,t}, navLink(route,label).
- `js/app.js`: `window.Sections={}` registry; DATA_FILES list; loads all JSON into `D`; router on hashchange: routes: ``→home, `constitution`, `results`, `franchises`, `franchise/ID`, `records`, `drafts`, `rivalries`, `divisions`, `players`, `bets`, `newsletter`, `newsletter/N`, `fame`. Each section module: `Sections.<name>={nav:'Label',icon:'🏈',render(ctx)→html}` where ctx={D,Lib,params[]}. Lineup JSONs fetched lazily by franchise section.
- Section files: `js/sections/home.js`, `constitution.js`, `results.js`, `franchises.js` (list + detail), `records.js`, `drafts.js`, `rivalries.js`, `divisions.js`, `players.js`, `bets.js`, `newsletter.js` (list + detail), `fame.js`.

## CSS component classes (styles.css MUST define all of these; sections use ONLY these)
Layout: `.wrap` (max-width 1100px container), `.page-head`, `.page-title`, `.page-sub`
Cards/grid: `.grid` (responsive auto-fit minmax(270px,1fr)), `.card`, `.card-t`, `.card-sub`
Stats: `.stats` (grid auto-fit minmax(110px,1fr)), `.stat`, `.stat-v` (big number), `.stat-l` (label)
Tables: `.tbl-wrap` (overflow-x:auto), `table.tbl`, `.num` (right-align), `tr.hl`
People: `.avatar` (52px round), `.avatar.lg` (104px), `.avatar.sm` (34px), `.initials` (colored fallback circle)
Chips/tabs: `.chip`, `.chip.gold`, `.chip.green`, `.tabs`, `.tab`, `.tab.on`
Bracket: `.bracket` (flex), `.bround`, `.bmatch`, `.bteam`, `.bteam.win`, `.bseed`
Rows: `.row` (flex space-between, padding), `.row + .row` dividers
Hero: `.hero`, `.hero-inner`, `.hero-logo`
Forms: `input.search`, `.btn`
Newsletter: `.nl` container; inner classes from data: `.nl-section`, `.nl-eyebrow`, `.nl-section-title`, `.nl-champ-banner`
Medals: `.medal-dot` (colored circle w/ position letter)
Rivalry: `.vs-badge`
Utilities: `.muted`, `.gold` (text), `.green` (text), `.red` (text), `.center`, `.mt1`, `.mt2`, `.mono`, `.two-col` (2-col on desktop, 1-col mobile)
Header/nav: `.site-header`, `.brand`, `.nav` (horizontal scroll on mobile), `.nav-link`, `.nav-link.on`, `.site-footer`

## Design
Dark "stadium night": bg #0a1420 / #0d1b2a, cards #12233a-ish, field-green #2ea36b accents, gold #d4a72c accents, text #e8eef5. Mobile-first; desktop ≥900px gets wider grids and two-col layouts. No external CDNs — everything local.

## PWA
`manifest.json` (name "The Gridiron Gentlemen's Society", short_name "Gridiron Gents", display standalone, theme_color #0a1420, icons assets/icon-192.png + icon-512.png), `sw.js` (cache-first app shell: /, index.html, css, js, assets; network-first `data/` with cache fallback), apple-touch-icon.png + icon PNGs already in assets/.
