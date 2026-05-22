// src/data/leaders.js
// Mock church structure for the admin compliance dashboard.
// This data stubs the Neo4j leader queries until real Cypher queries are wired.
//
// Shape mirrors the Neo4j response described in ADMIN_DASHBOARD_CONTEXT.md:
// {
//   userId, fullName, level,
//   streamId, streamName,
//   councilId, councilName,
//   governorshipId, governorshipName,
//   bacentaId, bacentaName  — null for governorship/overseer leaders
// }

// ── Streams ───────────────────────────────────────────────────────────────────

export const MOCK_STREAMS = [
  { id: 'stream-col',  name: 'Colossians' },
  { id: 'stream-eph',  name: 'Ephesians' },
  { id: 'stream-gal',  name: 'Galatians' },
  { id: 'stream-php',  name: 'Philippians' },
]

// ── Councils (Overseers) ──────────────────────────────────────────────────────

export const MOCK_COUNCILS = [
  { id: 'cou-col1', streamId: 'stream-col', name: 'Colossians 1', overseerName: 'Isaac Agyeman',  overseerUserId: 'u-ov-001' },
  { id: 'cou-col2', streamId: 'stream-col', name: 'Colossians 2', overseerName: 'Edwin Ogoe',     overseerUserId: 'u-ov-002' },
  { id: 'cou-col3', streamId: 'stream-col', name: 'Colossians 3', overseerName: 'Nathan Kudowor', overseerUserId: 'u-ov-003' },

  { id: 'cou-eph1', streamId: 'stream-eph', name: 'Ephesians 1',  overseerName: 'Samuel Tetteh',  overseerUserId: 'u-ov-004' },
  { id: 'cou-eph2', streamId: 'stream-eph', name: 'Ephesians 2',  overseerName: 'Grace Asante',   overseerUserId: 'u-ov-005' },

  { id: 'cou-gal1', streamId: 'stream-gal', name: 'Galatians 1',  overseerName: 'Abena Mensah',   overseerUserId: 'u-ov-006' },
  { id: 'cou-gal2', streamId: 'stream-gal', name: 'Galatians 2',  overseerName: 'Kofi Acheampong',overseerUserId: 'u-ov-007' },

  { id: 'cou-php1', streamId: 'stream-php', name: 'Philippians 1',overseerName: 'Joyce Boateng',  overseerUserId: 'u-ov-008' },
  { id: 'cou-php2', streamId: 'stream-php', name: 'Philippians 2',overseerName: 'Kwame Darko',    overseerUserId: 'u-ov-009' },
]

// ── Governorships ─────────────────────────────────────────────────────────────

export const MOCK_GOVERNORSHIPS = [
  // Colossians 1
  { id: 'gov-hm',  councilId: 'cou-col1', name: 'Haatso Mabey',      governorName: 'Malcolm Otchere',    governorUserId: 'u-gov-001' },
  { id: 'gov-la',  councilId: 'cou-col1', name: 'Legon Achimota',     governorName: 'Gifty Quaye',        governorUserId: 'u-gov-002' },
  { id: 'gov-tm',  councilId: 'cou-col1', name: 'Tema Mantse',        governorName: 'Ato Mensah',         governorUserId: 'u-gov-003' },

  // Colossians 2
  { id: 'gov-kn',  councilId: 'cou-col2', name: 'Kasoa North',        governorName: 'Esi Owusu',          governorUserId: 'u-gov-004' },
  { id: 'gov-ks',  councilId: 'cou-col2', name: 'Kasoa South',        governorName: 'Kobbina Adusei',     governorUserId: 'u-gov-005' },

  // Colossians 3
  { id: 'gov-mm',  councilId: 'cou-col3', name: 'Madina Mayera',      governorName: 'Belinda Tetteh',     governorUserId: 'u-gov-006' },
  { id: 'gov-ns',  councilId: 'cou-col3', name: 'North Suntreso',     governorName: 'Prince Agyei',       governorUserId: 'u-gov-007' },

  // Ephesians 1
  { id: 'gov-e1a', councilId: 'cou-eph1', name: 'Dansoman Alpha',     governorName: 'Yaw Frempong',       governorUserId: 'u-gov-008' },
  { id: 'gov-e1b', councilId: 'cou-eph1', name: 'Dansoman Beta',      governorName: 'Akua Poku',          governorUserId: 'u-gov-009' },

  // Ephesians 2
  { id: 'gov-e2a', councilId: 'cou-eph2', name: 'Ablekuma East',      governorName: 'Kweku Boateng',      governorUserId: 'u-gov-010' },

  // Galatians 1
  { id: 'gov-g1a', councilId: 'cou-gal1', name: 'Kumasi Central',     governorName: 'Adwoa Asante',       governorUserId: 'u-gov-011' },
  { id: 'gov-g1b', councilId: 'cou-gal1', name: 'Nhyiaeso',           governorName: 'Kwabena Yeboah',     governorUserId: 'u-gov-012' },

  // Galatians 2
  { id: 'gov-g2a', councilId: 'cou-gal2', name: 'Bantama',            governorName: 'Ama Adomako',        governorUserId: 'u-gov-013' },

  // Philippians 1
  { id: 'gov-p1a', councilId: 'cou-php1', name: 'Cape Coast Central', governorName: 'Emmanuel Boateng',   governorUserId: 'u-gov-014' },

  // Philippians 2
  { id: 'gov-p2a', councilId: 'cou-php2', name: 'Takoradi',           governorName: 'Esi Mensah',         governorUserId: 'u-gov-015' },
]

// ── Bacentas ──────────────────────────────────────────────────────────────────

export const MOCK_BACENTAS = [
  // Haatso Mabey
  { id: 'bac-gc',  governorshipId: 'gov-hm', name: 'God Chasers',    leaderName: 'David Dag Vanderpuije', leaderUserId: '7573ecf9-b445-40ce-ba24-5c8ed262bf82' },
  { id: 'bac-fh',  governorshipId: 'gov-hm', name: 'Fruitful Haatso',leaderName: 'Ama Boateng',            leaderUserId: 'u-bac-002' },
  { id: 'bac-rr',  governorshipId: 'gov-hm', name: 'Royal Remnant',  leaderName: 'Kojo Asante',            leaderUserId: 'u-bac-003' },

  // Legon Achimota
  { id: 'bac-le1', governorshipId: 'gov-la', name: 'Grace Chapel',   leaderName: 'Efua Darko',             leaderUserId: 'u-bac-004' },
  { id: 'bac-le2', governorshipId: 'gov-la', name: 'Faith Legon',    leaderName: 'Nana Osei',              leaderUserId: 'u-bac-005' },

  // Tema Mantse
  { id: 'bac-tm1', governorshipId: 'gov-tm', name: 'Tema Light',     leaderName: 'Akosua Amoah',           leaderUserId: 'u-bac-006' },
  { id: 'bac-tm2', governorshipId: 'gov-tm', name: 'Tema Harvest',   leaderName: 'Kweku Annan',            leaderUserId: 'u-bac-007' },

  // Kasoa North
  { id: 'bac-kn1', governorshipId: 'gov-kn', name: 'New Kasoa',      leaderName: 'Abena Danso',            leaderUserId: 'u-bac-008' },
  { id: 'bac-kn2', governorshipId: 'gov-kn', name: 'Kasoa Bethel',   leaderName: 'Kofi Acheampong Jr',     leaderUserId: 'u-bac-009' },

  // Kasoa South
  { id: 'bac-ks1', governorshipId: 'gov-ks', name: 'Kasoa Hope',     leaderName: 'Yaa Tawiah',             leaderUserId: 'u-bac-010' },

  // Madina Mayera
  { id: 'bac-mm1', governorshipId: 'gov-mm', name: 'Madina Summit',  leaderName: 'Kwaku Frimpong',         leaderUserId: 'u-bac-011' },
  { id: 'bac-mm2', governorshipId: 'gov-mm', name: 'Mayera Flock',   leaderName: 'Araba Mensah',           leaderUserId: 'u-bac-012' },

  // North Suntreso
  { id: 'bac-ns1', governorshipId: 'gov-ns', name: 'Suntreso Zion',  leaderName: 'Kwesi Bonsu',            leaderUserId: 'u-bac-013' },

  // Dansoman Alpha
  { id: 'bac-e1a1',governorshipId: 'gov-e1a',name: 'Dansoman Flame', leaderName: 'Adwoa Poku',             leaderUserId: 'u-bac-014' },
  { id: 'bac-e1a2',governorshipId: 'gov-e1a',name: 'Dansoman Star',  leaderName: 'Ekow Quaye',             leaderUserId: 'u-bac-015' },

  // Dansoman Beta
  { id: 'bac-e1b1',governorshipId: 'gov-e1b',name: 'Beta Rock',      leaderName: 'Esi Darko',              leaderUserId: 'u-bac-016' },

  // Ablekuma East
  { id: 'bac-e2a1',governorshipId: 'gov-e2a',name: 'Ablekuma Fire',  leaderName: 'Kwame Asante',           leaderUserId: 'u-bac-017' },

  // Kumasi Central
  { id: 'bac-g1a1',governorshipId: 'gov-g1a',name: 'Central Light',  leaderName: 'Osei Bonsu',             leaderUserId: 'u-bac-018' },
  { id: 'bac-g1a2',governorshipId: 'gov-g1a',name: 'Glory House',    leaderName: 'Akua Osei',              leaderUserId: 'u-bac-019' },

  // Nhyiaeso
  { id: 'bac-g1b1',governorshipId: 'gov-g1b',name: 'Nhyiaeso Vine',  leaderName: 'Kobbina Mensah',         leaderUserId: 'u-bac-020' },

  // Bantama
  { id: 'bac-g2a1',governorshipId: 'gov-g2a',name: 'Bantama Rock',   leaderName: 'Yaa Acheampong',         leaderUserId: 'u-bac-021' },

  // Cape Coast Central
  { id: 'bac-p1a1',governorshipId: 'gov-p1a',name: 'Cape Coast Zion',leaderName: 'Ato Aidoo',              leaderUserId: 'u-bac-022' },

  // Takoradi
  { id: 'bac-p2a1',governorshipId: 'gov-p2a',name: 'Takoradi Grace', leaderName: 'Afia Asare',             leaderUserId: 'u-bac-023' },
]

// ── Flat leader list helpers ──────────────────────────────────────────────────

/**
 * Returns all leaders in a stream as a flat array of leader objects.
 * Each object is shaped to match the Neo4j response described in
 * ADMIN_DASHBOARD_CONTEXT.md — swap this with real Neo4j data later.
 */
export function getMockLeadersForStream(streamId) {
  const stream = MOCK_STREAMS.find((s) => s.id === streamId)
  if (!stream) return []

  const councils = MOCK_COUNCILS.filter((c) => c.streamId === streamId)
  const leaders = []

  for (const council of councils) {
    // Overseer
    leaders.push({
      userId: council.overseerUserId,
      fullName: council.overseerName,
      level: 'overseer',
      streamId: stream.id,
      streamName: stream.name,
      councilId: council.id,
      councilName: council.name,
      governorshipId: null,
      governorshipName: null,
      bacentaId: null,
      bacentaName: null,
    })

    const govs = MOCK_GOVERNORSHIPS.filter((g) => g.councilId === council.id)
    for (const gov of govs) {
      // Governor
      leaders.push({
        userId: gov.governorUserId,
        fullName: gov.governorName,
        level: 'governorship',
        streamId: stream.id,
        streamName: stream.name,
        councilId: council.id,
        councilName: council.name,
        governorshipId: gov.id,
        governorshipName: gov.name,
        bacentaId: null,
        bacentaName: null,
      })

      const bacentas = MOCK_BACENTAS.filter((b) => b.governorshipId === gov.id)
      for (const bac of bacentas) {
        // Bacenta leader
        leaders.push({
          userId: bac.leaderUserId,
          fullName: bac.leaderName,
          level: 'bacenta',
          streamId: stream.id,
          streamName: stream.name,
          councilId: council.id,
          councilName: council.name,
          governorshipId: gov.id,
          governorshipName: gov.name,
          bacentaId: bac.id,
          bacentaName: bac.name,
        })
      }
    }
  }

  return leaders
}

export function getMockLeadersForCouncil(councilId) {
  const council = MOCK_COUNCILS.find((c) => c.id === councilId)
  if (!council) return []
  const stream = MOCK_STREAMS.find((s) => s.id === council.streamId)
  const leaders = []

  leaders.push({
    userId: council.overseerUserId,
    fullName: council.overseerName,
    level: 'overseer',
    streamId: stream.id,
    streamName: stream.name,
    councilId: council.id,
    councilName: council.name,
    governorshipId: null,
    governorshipName: null,
    bacentaId: null,
    bacentaName: null,
  })

  const govs = MOCK_GOVERNORSHIPS.filter((g) => g.councilId === councilId)
  for (const gov of govs) {
    leaders.push({
      userId: gov.governorUserId,
      fullName: gov.governorName,
      level: 'governorship',
      streamId: stream.id,
      streamName: stream.name,
      councilId: council.id,
      councilName: council.name,
      governorshipId: gov.id,
      governorshipName: gov.name,
      bacentaId: null,
      bacentaName: null,
    })

    const bacentas = MOCK_BACENTAS.filter((b) => b.governorshipId === gov.id)
    for (const bac of bacentas) {
      leaders.push({
        userId: bac.leaderUserId,
        fullName: bac.leaderName,
        level: 'bacenta',
        streamId: stream.id,
        streamName: stream.name,
        councilId: council.id,
        councilName: council.name,
        governorshipId: gov.id,
        governorshipName: gov.name,
        bacentaId: bac.id,
        bacentaName: bac.name,
      })
    }
  }

  return leaders
}

export function getMockLeadersForGovernorship(govId) {
  const gov = MOCK_GOVERNORSHIPS.find((g) => g.id === govId)
  if (!gov) return []
  const council = MOCK_COUNCILS.find((c) => c.id === gov.councilId)
  const stream = MOCK_STREAMS.find((s) => s.id === council.streamId)
  const leaders = []

  leaders.push({
    userId: gov.governorUserId,
    fullName: gov.governorName,
    level: 'governorship',
    streamId: stream.id,
    streamName: stream.name,
    councilId: council.id,
    councilName: council.name,
    governorshipId: gov.id,
    governorshipName: gov.name,
    bacentaId: null,
    bacentaName: null,
  })

  const bacentas = MOCK_BACENTAS.filter((b) => b.governorshipId === govId)
  for (const bac of bacentas) {
    leaders.push({
      userId: bac.leaderUserId,
      fullName: bac.leaderName,
      level: 'bacenta',
      streamId: stream.id,
      streamName: stream.name,
      councilId: council.id,
      councilName: council.name,
      governorshipId: gov.id,
      governorshipName: gov.name,
      bacentaId: bac.id,
      bacentaName: bac.name,
    })
  }

  return leaders
}

export function getMockLeaderById(userId) {
  // Search all levels
  for (const stream of MOCK_STREAMS) {
    const all = getMockLeadersForStream(stream.id)
    const found = all.find((l) => l.userId === userId)
    if (found) return found
  }
  return null
}
