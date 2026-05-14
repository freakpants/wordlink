// words.js – word pool for WordLink; daily pair is seeded by date

const CURATED_WORDS = [
  'ocean', 'mountain', 'fire', 'ice', 'rain', 'snow', 'wind', 'storm',
  'thunder', 'lightning', 'flood', 'drought', 'frost', 'fog', 'mist', 'tide',
  'aurora', 'earthquake', 'volcano', 'glacier', 'avalanche', 'blizzard', 'tornado', 'hurricane',
  'twilight', 'dawn', 'dusk', 'forest', 'desert', 'river', 'valley', 'meadow',
  'cliff', 'cave', 'canyon', 'jungle', 'swamp', 'dune', 'lagoon', 'reef',
  'tundra', 'delta', 'geyser', 'coral', 'island', 'harbor', 'coast', 'sun',
  'moon', 'star', 'earth', 'cloud', 'meteor', 'satellite', 'horizon', 'zenith',
  'abyss', 'void', 'wolf', 'eagle', 'dolphin', 'tiger', 'rabbit', 'butterfly',
  'shark', 'hawk', 'fox', 'bear', 'horse', 'deer', 'snake', 'spider',
  'crow', 'whale', 'lion', 'elephant', 'penguin', 'octopus', 'jaguar', 'falcon',
  'owl', 'salmon', 'firefly', 'scorpion', 'bat', 'raven', 'bee', 'moth',
  'sheep', 'bird', 'fish', 'animal', 'rose', 'oak', 'bamboo', 'cactus',
  'vine', 'mushroom', 'fern', 'lotus', 'pine', 'willow', 'thorn', 'moss',
  'ivy', 'orchid', 'cedar', 'seed', 'root', 'wing', 'blossom', 'orchard',
  'compass', 'mirror', 'bridge', 'lantern', 'sword', 'clock', 'key', 'anchor',
  'telescope', 'microscope', 'hammer', 'feather', 'candle', 'torch', 'wheel', 'chain',
  'rope', 'arrow', 'shield', 'drum', 'piano', 'quill', 'map', 'cage',
  'crown', 'coin', 'bell', 'gate', 'ladder', 'lens', 'prism', 'hourglass',
  'beacon', 'window', 'wall', 'door', 'ship', 'train', 'castle', 'market',
  'library', 'cathedral', 'temple', 'tower', 'maze', 'museum', 'dungeon', 'lighthouse',
  'observatory', 'citadel', 'arena', 'monastery', 'garden', 'factory', 'hospital', 'battlefield',
  'stadium', 'city', 'village', 'metropolis', 'dream', 'memory', 'silence', 'shadow',
  'justice', 'chaos', 'wisdom', 'courage', 'fear', 'hope', 'faith', 'doubt',
  'beauty', 'truth', 'power', 'harmony', 'mystery', 'legend', 'myth', 'fate',
  'chance', 'echo', 'vision', 'hunger', 'grief', 'joy', 'rage', 'shame',
  'pride', 'exile', 'war', 'peace', 'love', 'hate', 'light', 'darkness',
  'freedom', 'origin', 'future', 'ghost', 'omen', 'curse', 'miracle', 'summer',
  'winter', 'night', 'noon', 'north', 'south', 'east', 'west', 'ancient',
  'modern', 'calm', 'bread', 'wine', 'salt', 'honey', 'spice', 'poison',
  'medicine', 'feast', 'famine', 'coffee', 'gold', 'silver', 'glass', 'stone',
  'rock', 'iron', 'crystal', 'amber', 'fossil', 'neon', 'sand', 'ash',
  'king', 'servant', 'child', 'elder', 'teacher', 'student', 'warrior', 'monk',
  'shepherd', 'merchant', 'poet', 'spy', 'hunter', 'music', 'art', 'science',
  'math', 'poetry', 'robot', 'dance', 'whisper', 'shout', 'laugh', 'cry',
  'harvest', 'flight', 'birth', 'death', 'sleep',
];

// Broad English dictionary sample (2,500 filtered entries from a larger
// frequency list) so practice mode has a deep but bounded word pool.
const DICTIONARY_WORDS = [
  'living', 'major', 'media', 'phone', 'players', 'behind', 'building', 'easy',
  'gonna', 'near', 'plan', 'political', 'quite', 'talking', 'works', 'according',
  'available', 'education', 'final', 'former', 'front', 'kids', 'list', 'ready',
  'sometimes', 'street', 'bring', 'college', 'current', 'example', 'experience', 'heard',
  'london', 'meet', 'program', 'type', 'baby', 'father', 'march', 'process',
  'song', 'study', 'word', 'across', 'action', 'clear', 'gave', 'gets',
  'himself', 'month', 'outside', 'self', 'students', 'words', 'board', 'cost',
  'field', 'held', 'instead', 'main', 'moment', 'mother', 'road', 'seems',
  'thinking', 'town', 'wants', 'department', 'energy', 'fight', 'fine', 'force',
  'hear', 'issue', 'played', 'points', 'price', 'rest', 'results', 'running',
  'shows', 'space', 'term', 'wife', 'america', 'beautiful', 'date', 'goes',
  'killed', 'land', 'miss', 'project', 'shot', 'site', 'strong', 'account',
  'especially', 'eyes', 'include', 'june', 'parents', 'period', 'position', 'record',
  'similar', 'total', 'above', 'club', 'common', 'died', 'film', 'happened',
  'knew', 'lead', 'likely', 'military', 'perfect', 'personal', 'security', 'share',
  'april', 'center', 'county', 'couple', 'dead', 'english', 'happen', 'hold',
  'industry', 'inside', 'issues', 'online', 'player', 'private', 'problems', 'return',
  'rights', 'sense', 'test', 'view', 'weeks', 'break', 'british', 'companies',
  'event', 'higher', 'hour', 'member', 'middle', 'needed', 'present', 'result',
  'sorry', 'takes', 'training', 'wish', 'answer', 'design', 'finally', 'girls',
  'gone', 'guess', 'interest', 'july', 'learn', 'policy', 'society', 'added',
  'alone', 'average', 'bank', 'brought', 'certain', 'church', 'hands', 'longer',
  'medical', 'movie', 'original', 'park', 'performance', 'press', 'received', 'role',
  'sent', 'themselves', 'tried', 'worked', 'worth', 'areas', 'became', 'bill',
  'books', 'cool', 'director', 'exactly', 'giving', 'ground', 'meeting', 'provide',
  'questions', 'relationship', 'september', 'sound', 'source', 'usually', 'value', 'evidence',
  'follow', 'lives', 'official', 'production', 'rate', 'reading', 'round', 'save',
  'stand', 'stuff', 'whatever', 'amount', 'blue', 'countries', 'david', 'drive',
  'fall', 'fast', 'federal', 'feeling', 'felt', 'green', 'league', 'management',
  'match', 'model', 'picture', 'size', 'step', 'trust', 'central', 'changes',
  'england', 'forward', 'groups', 'page', 'paid', 'range', 'review', 'trade',
  'upon', 'various', 'attention', 'brother', 'cannot', 'character', 'chief', 'football',
  'james', 'looked', 'lower', 'natural', 'october', 'property', 'quality', 'send',
  'style', 'vote', 'amazing', 'august', 'blood', 'china', 'complete', 'economic',
  'hell', 'involved', 'itself', 'language', 'lord', 'november', 'related', 'serious',
  'stage', 'terms', 'title', 'article', 'attack', 'born', 'damn', 'decided',
  'decision', 'enjoy', 'entire', 'french', 'january', 'kill', 'perhaps', 'poor',
  'release', 'situation', 'technology', 'turned', 'website', 'written', 'choice', 'code',
  'considered', 'continue', 'council', 'cover', 'currently', 'election', 'european', 'events',
  'financial', 'foreign', 'hair', 'increase', 'legal', 'lose', 'michael', 'pick',
  'race', 'seem', 'seven', 'sign', 'simple', 'simply', 'staff', 'super',
  'union', 'walk', 'washington', 'began', 'built', 'career', 'changed', 'crazy',
  'daily', 'daughter', 'december', 'difficult', 'figure', 'knows', 'loss', 'ones',
  'paper', 'parts', 'popular', 'published', 'safe', 'starting', 'systems', 'version',
  'voice', 'whose', 'writing', 'army', 'australia', 'forget', 'goal', 'huge',
  'internet', 'listen', 'okay', 'practice', 'rules', 'success', 'towards', 'waiting',
  'ways', 'access', 'base', 'below', 'created', 'deep', 'followed', 'mark',
  'missing', 'offer', 'pass', 'professional', 'released', 'risk', 'schools', 'table',
  'ball', 'build', 'card', 'cases', 'dark', 'district', 'europe', 'george',
  'india', 'mine', 'minister', 'note', 'percent', 'piece', 'products', 'recent',
  'seeing', 'straight', 'visit', 'wanna', 'wrote', 'allowed', 'boys', 'culture',
  'fans', 'february', 'gives', 'growth', 'included', 'married', 'officer', 'pain',
  'paul', 'places', 'respect', 'response', 'shall', 'speak', 'specific', 'standard',
  'tonight', 'write', 'album', 'century', 'charge', 'cold', 'create', 'effect',
  'eight', 'except', 'funny', 'limited', 'moving', 'network', 'provided', 'recently',
  'required', 'sales', 'spent', 'store', 'tomorrow', 'track', 'watching', 'weight',
  'addition', 'ahead', 'allow', 'anti', 'association', 'beat', 'brown', 'capital',
  'chinese', 'committee', 'conference', 'difference', 'double', 'expect', 'moved', 'normal',
  'plans', 'population', 'potential', 'pressure', 'radio', 'russian', 'station', 'text',
  'treatment', 'western', 'beginning', 'california', 'campaign', 'certainly', 'completely', 'content',
  'credit', 'cross', 'described', 'despite', 'female', 'focus', 'husband', 'individual',
  'interesting', 'join', 'kept', 'leading', 'loved', 'message', 'miles', 'nearly',
  'particular', 'previous', 'quickly', 'region', 'reported', 'section', 'sort', 'speed',
  'travel', 'consider', 'contact', 'drop', 'fair', 'feet', 'jesus', 'link',
  'positive', 'sale', 'throughout', 'tour', 'welcome', 'absolutely', 'additional', 'beyond',
  'conditions', 'earlier', 'extra', 'forces', 'immediately', 'jobs', 'leaving', 'minute',
  'nature', 'numbers', 'quick', 'sell', 'significant', 'studies', 'unless', 'winning',
  'agree', 'canada', 'clean', 'computer', 'construction', 'episode', 'favorite', 'income',
  'levels', 'manager', 'movement', 'photo', 'posted', 'safety', 'scene', 'sold',
  'sounds', 'spend', 'statement', 'teams', 'ability', 'announced', 'asking', 'calling',
  'coach', 'collection', 'continued', 'costs', 'definitely', 'designed', 'expected', 'friday',
  'happens', 'heavy', 'includes', 'knowledge', 'particularly', 'search', 'subject', 'wide',
  'author', 'centre', 'claim', 'developed', 'generally', 'german', 'global', 'goals',
  'gotta', 'hotel', 'interested', 'judge', 'lady', 'leader', 'letter', 'lines',
  'material', 'named', 'nobody', 'opportunity', 'plus', 'product', 'regular', 'secretary',
  'sister', 'stories', 'unit', 'workers', 'annual', 'anymore', 'battle', 'brain',
  'contract', 'degree', 'families', 'features', 'finished', 'floor', 'france', 'growing',
  'hurt', 'image', 'insurance', 'majority', 'meant', 'opening', 'opinion', 'physical',
  'reach', 'rule', 'seriously', 'sports', 'stupid', 'successful', 'active', 'administration',
  'approach', 'australian', 'biggest', 'cancer', 'civil', 'defense', 'direction', 'independent',
  'master', 'none', 'reasons', 'russia', 'stock', 'trump', 'weekend', 'wonder',
  'worst', 'africa', 'awesome', 'band', 'beach', 'cash', 'clearly', 'commercial',
  'compared', 'effort', 'ended', 'fighting', 'imagine', 'impact', 'lack', 'latest',
  'learning', 'multiple', 'older', 'operation', 'organization', 'passed', 'pictures', 'protect',
  'secret', 'senior', 'spring', 'sunday', 'telling', 'wear', 'activities', 'address',
  'analysis', 'anyway', 'bought', 'calls', 'choose', 'christmas', 'color', 'commission',
  'competition', 'details', 'direct', 'easily', 'finish', 'grand', 'increased', 'indian',
  'literally', 'luck', 'marriage', 'names', 'necessary', 'patients', 'resources', 'rich',
  'skin', 'speaking', 'supposed', 'sweet', 'thus', 'touch', 'yesterday', 'caught',
  'closed', 'congress', 'damage', 'directly', 'disease', 'doctor', 'drink', 'driving',
  'established', 'facebook', 'feels', 'germany', 'glad', 'greater', 'grow', 'largest',
  'machine', 'notice', 'overall', 'planning', 'professor', 'programs', 'records', 'reports',
  'shown', 'trip', 'associated', 'basic', 'captain', 'carry', 'cars', 'crime',
  'effective', 'effects', 'explain', 'fully', 'highly', 'holding', 'japan', 'laws',
  'male', 'parties', 'plant', 'reality', 'smith', 'spot', 'texas', 'worse',
  'advice', 'agreement', 'award', 'block', 'broken', 'caused', 'challenge', 'characters',
  'christian', 'comment', 'equipment', 'eventually', 'helped', 'holy', 'killing', 'lived',
  'lots', 'nation', 'otherwise', 'peter', 'prices', 'primary', 'purpose', 'rates',
  'responsible', 'shop', 'showing', 'sick', 'theory', 'uses', 'william', 'agency',
  'avoid', 'camera', 'catch', 'cell', 'comments', 'drug', 'economy', 'environment',
  'executive', 'foot', 'hall', 'mass', 'meaning', 'mission', 'nine', 'officers',
  'operations', 'politics', 'produced', 'saturday', 'status', 'therefore', 'trial', 'truly',
  'weather', 'activity', 'application', 'claims', 'complex', 'condition', 'division', 'evening',
  'google', 'heat', 'highest', 'interview', 'located', 'location', 'murder', 'obama',
  'offered', 'putting', 'queen', 'seconds', 'showed', 'sitting', 'standing', 'stars',
  'walking', 'accept', 'actual', 'appear', 'attempt', 'broke', 'channel', 'distance',
  'eating', 'exchange', 'fell', 'finding', 'learned', 'losing', 'mobile', 'northern',
  'opened', 'placed', 'powerful', 'prior', 'protection', 'reached', 'receive', 'religious',
  'ride', 'robert', 'royal', 'screen', 'serve', 'signed', 'slow', 'species',
  'speech', 'traffic', 'tree', 'types', 'wearing', 'whom', 'wonderful', 'agreed',
  'airport', 'animals', 'appears', 'begin', 'benefits', 'bottom', 'cities', 'demand',
  'engine', 'everybody', 'famous', 'ideas', 'investment', 'keeping', 'notes', 'partner',
  'plays', 'raised', 'runs', 'solution', 'songs', 'sources', 'southern', 'square',
  'stopped', 'structure', 'thomas', 'traditional', 'twice', 'worry', 'americans', 'appeared',
  'becomes', 'brand', 'cent', 'chicago', 'count', 'covered', 'critical', 'digital',
  'forced', 'fourth', 'fresh', 'lake', 'mental', 'mentioned', 'missed', 'mostly',
  'mouth', 'owner', 'photos', 'previously', 'realize', 'remain', 'scale', 'score',
  'separate', 'smart', 'starts', 'surface', 'throw', 'totally', 'twitter', 'views',
  'wedding', 'acting', 'actions', 'african', 'arms', 'benefit', 'budget', 'click',
  'estate', 'failed', 'fashion', 'feature', 'fund', 'generation', 'hearing', 'hill',
  'jack', 'larger', 'louis', 'metal', 'paris', 'profile', 'pull', 'push',
  'returned', 'seat', 'seemed', 'sexual', 'target', 'understanding', 'agent', 'apply',
  'authority', 'basis', 'becoming', 'chris', 'draw', 'dude', 'employees', 'enter',
  'follows', 'foundation', 'gain', 'http', 'individuals', 'japanese', 'leaders', 'prime',
  'projects', 'ring', 'rise', 'selling', 'served', 'soul', 'spread', 'supply',
  'waste', 'weird', 'adult', 'apparently', 'artist', 'chairman', 'edition', 'engineering',
  'grade', 'happening', 'healthy', 'institute', 'method', 'mike', 'monday', 'nations',
  'obviously', 'option', 'prison', 'provides', 'remains', 'senate', 'smaller', 'somebody',
  'strength', 'users', 'wild', 'winner', 'arrived', 'camp', 'cast', 'christ',
  'continues', 'correct', 'dangerous', 'extremely', 'firm', 'greatest', 'handle', 'improve',
  'indeed', 'leaves', 'movies', 'negative', 'prevent', 'removed', 'richard', 'spirit',
  'television', 'till', 'trouble', 'videos', 'advantage', 'apart', 'aware', 'customers',
  'decide', 'dinner', 'dollars', 'eastern', 'fifth', 'function', 'gift', 'helping',
  'herself', 'impossible', 'influence', 'items', 'marketing', 'mary', 'materials', 'produce',
  'progress', 'proud', 'require', 'shooting', 'shut', 'standards', 'tells', 'thinks',
  'wood', 'background', 'carried', 'charles', 'classes', 'completed', 'concept', 'copy',
  'dear', 'dogs', 'drugs', 'efforts', 'host', 'housing', 'israel', 'journal',
  'labor', 'leadership', 'length', 'lucky', 'neither', 'onto', 'patient', 'possibly',
  'prove', 'rare', 'setting', 'skills', 'software', 'thousands', 'tough', 'units',
  'alive', 'apple', 'balance', 'birthday', 'bitch', 'boss', 'cards', 'changing',
  'connection', 'dress', 'easier', 'fellow', 'florida', 'knowing', 'liked', 'magic',
  'managed', 'owned', 'request', 'stick', 'turns', 'vehicle', 'volume', 'wake',
  'believed', 'billion', 'busy', 'buying', 'cells', 'concerned', 'conversation', 'corner',
  'criminal', 'cultural', 'develop', 'driver', 'ends', 'existing', 'farm', 'file',
  'frank', 'guide', 'images', 'investigation', 'mexico', 'operating', 'paying', 'presented',
  'raise', 'responsibility', 'roll', 'slightly', 'suggest', 'surprise', 'technical', 'thoughts',
  'treat', 'unique', 'variety', 'violence', 'weapons', 'yours', 'youth', 'appreciate',
  'bigger', 'breaking', 'discovered', 'dont', 'edge', 'evil', 'excited', 'forever',
  'funds', 'helps', 'henry', 'injury', 'lovely', 'magazine', 'martin', 'models',
  'offers', 'ordered', 'parliament', 'prepared', 'reference', 'religion', 'sites', 'somewhere',
  'stated', 'strategy', 'teachers', 'accounts', 'angeles', 'audience', 'blog', 'closer',
  'core', 'democratic', 'description', 'dropped', 'excellent', 'exist', 'figures', 'forms',
  'guard', 'honest', 'issued', 'joined', 'jones', 'lies', 'likes', 'mention',
  'nuclear', 'orders', 'port', 'presence', 'reaction', 'reduce', 'shoot', 'sides',
  'solid', 'spanish', 'sport', 'steps', 'stress', 'taste', 'victory', 'afternoon',
  'assistant', 'britain', 'citizens', 'classic', 'clothes', 'decisions', 'electric', 'emergency',
  'entered', 'entirely', 'facts', 'failure', 'festival', 'flat', 'fuel', 'harry',
  'hello', 'houses', 'initial', 'introduced', 'johnson', 'kick', 'links', 'mail',
  'massive', 'matters', 'pair', 'picked', 'pieces', 'plane', 'plenty', 'prince',
  'proper', 'providing', 'quarter', 'regional', 'scott', 'session', 'shape', 'teaching',
  'toward', 'transfer', 'upper', 'useful', 'watched', 'willing', 'windows', 'zone',
  'accident', 'advanced', 'alternative', 'anywhere', 'articles', 'awards', 'boat', 'bringing',
  'capacity', 'cheap', 'climate', 'communities', 'discussion', 'drinking', 'duty', 'fantastic',
  'feelings', 'flying', 'governor', 'hundred', 'industrial', 'joint', 'options', 'path',
  'plants', 'policies', 'promise', 'proposed', 'purchase', 'remove', 'signs', 'spending',
  'steel', 'steve', 'supporting', 'terrible', 'tired', 'treated', 'turning', 'vice',
  'warm', 'afraid', 'arts', 'beer', 'border', 'canadian', 'command', 'crew',
  'crowd', 'dating', 'dick', 'elements', 'enemy', 'ensure', 'environmental', 'filled',
  'fixed', 'intelligence', 'intended', 'labour', 'limit', 'powers', 'profit', 'proof',
  'republican', 'soldiers', 'suit', 'wins', 'appearance', 'asian', 'attorney', 'banks',
  'behavior', 'bodies', 'brothers', 'buildings', 'chair', 'creating', 'debt', 'domestic',
  'expensive', 'grew', 'historical', 'homes', 'honestly', 'honor', 'jump', 'launch',
  'listed', 'minimum', 'native', 'noted', 'originally', 'planned', 'sets', 'suddenly',
  'supreme', 'survey', 'tech', 'trees', 'update', 'user', 'writer', 'yellow',
  'younger', 'attacks', 'charges', 'combined', 'communication', 'connected', 'contains', 'download',
  'email', 'ending', 'exercise', 'express', 'flow', 'formed', 'girlfriend', 'hero',
  'illegal', 'increasing', 'joke', 'loan', 'methods', 'officials', 'performed', 'planet',
  'relationships', 'restaurant', 'scotland', 'selected', 'shared', 'shopping', 'soft', 'stuck',
  'sugar', 'suggested', 'supported', 'surprised', 'taught', 'transport', 'accepted', 'adding',
  'affairs', 'allows', 'appeal', 'applied', 'appropriate', 'artists', 'boston', 'confirmed',
  'device', 'drama', 'entry', 'factor', 'feed', 'golden', 'grant', 'grown',
  'heads', 'hoping', 'keeps', 'lawyer', 'legs', 'lying', 'measures', 'mistake',
  'muslim', 'organizations', 'platform', 'pool', 'pulled', 'regarding', 'relations', 'requires',
  'route', 'saved', 'schedule', 'scientific', 'shoes', 'smoke', 'squad', 'teach',
  'testing', 'tests', 'values', 'walked', 'williams', 'abuse', 'angry', 'businesses',
  'candidate', 'comfortable', 'concern', 'developing', 'discuss', 'elections', 'emotional', 'everywhere',
  'facilities', 'falling', 'guns', 'hole', 'holiday', 'interests', 'internal', 'ireland',
  'italian', 'italy', 'jersey', 'letters', 'liberal', 'listening', 'loves', 'lunch',
  'milk', 'pack', 'payment', 'perform', 'recorded', 'relatively', 'sector', 'sharing',
  'streets', 'strike', 'studio', 'weak', 'youtube', 'actor', 'advance', 'apartment',
  'asia', 'chapter', 'committed', 'confidence', 'cook', 'cute', 'equal', 'fake',
  'finance', 'focused', 'hits', 'identity', 'journey', 'kitchen', 'korea', 'leads',
  'maintain', 'measure', 'numerous', 'owners', 'posts', 'properties', 'quiet', 'revealed',
  'specifically', 'split', 'task', 'taxes', 'taylor', 'twenty', 'urban', 'acts',
  'affected', 'aircraft', 'applications', 'approved', 'approximately', 'argument', 'arrested', 'claimed',
  'conflict', 'considering', 'corporate', 'debate', 'determined', 'distribution', 'documents', 'escape',
  'extended', 'factors', 'faster', 'fault', 'fill', 'films', 'flowers', 'friendly',
  'ladies', 'lights', 'millions', 'mixed', 'phase', 'properly', 'pure', 'reduced',
  'requirements', 'residents', 'revenue', 'secure', 'smile', 'strange', 'talent', 'temperature',
  'thousand', 'tony', 'troops', 'truck', 'votes', 'authorities', 'basically', 'besides',
  'blame', 'bowl', 'causes', 'chicken', 'collected', 'context', 'coverage', 'determine',
  'display', 'dying', 'elected', 'examples', 'experienced', 'falls', 'false', 'fired',
  'forgot', 'funding', 'identified', 'incredible', 'inspired', 'launched', 'meat', 'ministry',
  'mode', 'neck', 'noticed', 'novel', 'obvious', 'passing', 'positions', 'remaining',
  'scored', 'shirt', 'shots', 'slowly', 'stores', 'surgery', 'trading', 'tuesday',
  'whenever', 'worried', 'zero', 'alex', 'allowing', 'begins', 'champion', 'charged',
  'cream', 'crisis', 'daniel', 'delivered', 'editor', 'estimated', 'giant', 'iran',
  'jail', 'kingdom', 'literature', 'mayor', 'minor', 'moments', 'opposite', 'orange',
  'ourselves', 'pages', 'remained', 'selection', 'serving', 'signal', 'stream', 'struggle',
  'suicide', 'talked', 'theme', 'thursday', 'tiny', 'typically', 'unfortunately', 'usual',
  'vehicles', 'virginia', 'voted', 'voting', 'walls', 'wave', 'alcohol', 'assembly',
  'breakfast', 'bright', 'brings', 'capable', 'carrying', 'chosen', 'combination', 'conservative',
  'customer', 'cutting', 'desire', 'destroyed', 'draft', 'drunk', 'essential', 'fail',
  'familiar', 'finds', 'granted', 'guilty', 'humans', 'hundreds', 'improved', 'jewish',
  'largely', 'laughing', 'markets', 'medium', 'ohio', 'opportunities', 'papers', 'perfectly',
  'recommend', 'referred', 'relevant', 'seek', 'sending', 'solo', 'spoke', 'stands',
  'talks', 'ticket', 'unable', 'upset', 'answers', 'birds', 'bomb', 'creative',
  'cycle', 'dealing', 'directed', 'educational', 'entertainment', 'extreme', 'facility', 'fields',
  'goods', 'hang', 'holds', 'info', 'mainly', 'maximum', 'newspaper', 'offering',
  'painting', 'republic', 'reserve', 'returns', 'scared', 'scottish', 'shares', 'statistics',
  'switch', 'territory', 'threat', 'tickets', 'wales', 'adults', 'affect', 'appointed',
  'armed', 'aside', 'assistance', 'blow', 'bond', 'boyfriend', 'careful', 'circumstances',
  'communications', 'concerns', 'controlled', 'corporation', 'danger', 'deals', 'delivery', 'deserve',
  'devices', 'dollar', 'dreams', 'empty', 'enjoyed', 'explained', 'faces', 'folks',
  'fucked', 'gender', 'instance', 'kinda', 'matches', 'mile', 'motion', 'moves',
  'nick', 'pacific', 'prize', 'realized', 'reasonable', 'receiving', 'register', 'resolution',
  'rural', 'ryan', 'saving', 'sees', 'singing', 'spain', 'tools', 'typical',
  'universe', 'warning', 'wars', 'wednesday', 'admit', 'attitude', 'branch', 'brazil',
  'conducted', 'decades', 'dedicated', 'definition', 'drawing', 'favor', 'flag', 'frame',
  'guest', 'heaven', 'independence', 'institutions', 'jackson', 'kiss', 'load', 'plot',
  'possibility', 'random', 'recovery', 'rent', 'replace', 'represent', 'reviews', 'scenes',
  'seeking', 'senator', 'sentence', 'teeth', 'tips', 'trained', 'understood', 'academic',
  'academy', 'accurate', 'achieve', 'adam', 'afford', 'andrew', 'assume', 'bottle',
  'bunch', 'category', 'chat', 'cheese', 'chemical', 'clinton', 'competitive', 'detail',
  'diet', 'favourite', 'fruit', 'harder', 'index', 'item', 'lane', 'mess',
  'navy', 'normally', 'occurred', 'opposition', 'parent', 'permanent', 'personally', 'pleasure',
  'prefer', 'programme', 'representative', 'scheme', 'shift', 'stood', 'storage', 'tank',
  'tend', 'tight', 'transportation', 'ultimately', 'unlike', 'weekly', 'yard', 'anybody',
  'assets', 'basketball', 'button', 'candidates', 'combat', 'constitution', 'consumer', 'counter',
  'creation', 'crying', 'defined', 'depending', 'depression', 'describe', 'drivers', 'employment',
  'exclusive', 'excuse', 'expert', 'frequently', 'golf', 'grace', 'hopefully', 'identify',
  'importance', 'kevin', 'laid', 'latter', 'manufacturing', 'mining', 'object', 'partners',
  'pattern', 'performing', 'personnel', 'perspective', 'pregnant', 'premier', 'promote', 'revolution',
  'rooms', 'severe', 'sleeping', 'suppose', 'tool', 'tournament', 'turkey', 'victim',
  'victims', 'agents', 'amazon', 'arrest', 'attend', 'brilliant', 'carbon', 'catholic',
  'chose', 'circle', 'concert', 'crash', 'declared', 'deliver', 'depth', 'deputy',
  'dirty', 'doctors', 'earned', 'electronic', 'error', 'existence', 'experiences', 'expression',
  'headed', 'interior', 'legislation', 'maintenance', 'manner', 'mate', 'matt', 'nearby',
  'noise', 'pakistan', 'panel', 'personality', 'plate', 'practices', 'prepare', 'relief',
  'replaced', 'resistance', 'retail', 'rice', 'roads', 'roof', 'ships', 'somewhat',
  'staying', 'stronger', 'surely', 'updated', 'writers', 'absolute', 'advertising', 'agencies',
  'baseball', 'bathroom', 'bible', 'cable', 'championship', 'checked', 'client', 'constant',
  'dates', 'degrees', 'democrats', 'doors', 'driven', 'dumb', 'empire', 'exciting',
  'expansion', 'heavily', 'hide', 'incident', 'irish', 'linked', 'manage', 'messages',
  'michigan', 'multi', 'politicians', 'print', 'quit', 'refused', 'reporting', 'sight',
  'significantly', 'sing', 'soviet', 'weapon', 'widely', 'worldwide', 'ages', 'anniversary',
  'attractive', 'bike', 'broad', 'burn', 'cake', 'causing', 'closely', 'constantly',
  'contest', 'deaths', 'depends', 'drawn', 'fees', 'francisco', 'haha', 'hardly',
  'height', 'hidden', 'hong', 'invited', 'letting', 'loud', 'manchester', 'marine',
  'motor', 'officially', 'peak', 'portion', 'pounds', 'princess', 'protein', 'puts',
  'reform', 'regions', 'represented', 'respond', 'retirement', 'sample', 'seats', 'secondary',
  'solar', 'somehow', 'stayed', 'suffering', 'sydney', 'tries', 'ultimate', 'unknown',
  'wilson', 'wondering', 'attached', 'attacked', 'automatically', 'balls', 'battery', 'bills',
  'blind', 'breath', 'brief', 'carolina', 'chest', 'conduct', 'debut', 'decade',
  'destroy', 'differences', 'edward', 'engaged', 'experts', 'expressed', 'external', 'fantasy',
  'grab', 'hollywood', 'immediate', 'introduction', 'joseph', 'license', 'paint', 'pilot',
  'pink', 'presidential', 'principal', 'recognize', 'recognized', 'registered', 'regularly', 'rising',
  'seasons', 'shipping', 'singer', 'smoking', 'steam', 'suffered', 'survive', 'tall',
  'thats', 'theatre', 'therapy', 'witness', 'adopted', 'campus', 'chances', 'childhood',
  'clinical', 'clubs', 'comedy', 'commander', 'comparison', 'covers', 'defeat', 'defence',
  'democracy', 'detailed', 'entitled', 'exact', 'exposed', 'injured', 'jordan', 'kinds',
  'lets', 'loans', 'lock', 'musical', 'nose', 'objects', 'opposed', 'organized',
  'plastic', 'protected', 'purposes', 'quote', 'recording', 'semi', 'statements', 'suspect',
  'swear', 'techniques', 'trend', 'valuable', 'wealth', 'wise', 'yards', 'aged',
  'approval', 'aspects', 'attempts', 'burning', 'champions', 'contain', 'convention', 'dancing',
  'document', 'eggs', 'employee', 'engineer', 'equivalent', 'facing', 'fairly', 'fingers',
  'ford', 'founded', 'functions', 'gang', 'graduate', 'greek', 'hanging', 'inner',
  'islands', 'lift', 'marked', 'memories', 'miller', 'monthly', 'mountains', 'neighborhood',
  'operate', 'outstanding', 'permission', 'porn', 'racing', 'recommended', 'regulations', 'reply',
  'republicans', 'roman', 'scientists', 'shoulder', 'shower', 'solutions', 'sons', 'stations',
  'stephen', 'tradition', 'visited', 'visual', 'zealand', 'achieved', 'admitted', 'appointment',
  'authors', 'barely', 'bush', 'cabinet', 'celebrate', 'challenges', 'chocolate', 'coal',
  'colour', 'contemporary', 'criticism', 'davis', 'effectively', 'eric', 'extensive', 'faced',
  'filed', 'formation', 'fought', 'gained', 'gallery', 'highway', 'historic', 'hunt',
  'improvement', 'inch', 'initially', 'junior', 'jury', 'kong', 'korean', 'marks',
  'monster', 'obtained', 'olympic', 'philosophy', 'promised', 'repeat', 'returning', 'riding',
  'rough', 'santa', 'settlement', 'smell', 'sought', 'speaker', 'studied', 'suggests',
  'surrounding', 'tone', 'topic', 'toronto', 'universal', 'vast', 'visitors', 'wanting',
  'auto', 'consistent', 'continuing', 'earn', 'exists', 'finger', 'grey', 'guitar',
  'heading', 'howard', 'ignore', 'involving', 'latin', 'lewis', 'meal', 'meanwhile',
  'meetings', 'naturally', 'necessarily', 'offices', 'pants', 'partnership', 'payments', 'percentage',
  'pocket', 'practical', 'primarily', 'proved', 'rape', 'regardless', 'relative', 'represents',
  'rescue', 'resulting', 'rush', 'sarah', 'sessions', 'sharp', 'simon', 'soccer',
  'stable', 'structures', 'supplies', 'symptoms', 'temporary', 'tested', 'trick', 'attended',
  'audio', 'bone', 'brian', 'bullshit', 'chamber', 'chart', 'circuit', 'clothing',
  'complicated', 'confused', 'consequences', 'defend', 'divided', 'elizabeth', 'everyday', 'extent',
  'fishing', 'format', 'gotten', 'harm', 'healthcare', 'household', 'immigration', 'impressive',
  'jews', 'joining', 'killer', 'lesson', 'limits', 'loving', 'managers', 'membership',
  'miami', 'mount', 'nights', 'occur', 'parking', 'proposal', 'province', 'purchased',
  'recognition', 'reputation', 'rolling', 'shortly', 'situations', 'strongly', 'tears', 'technique',
  'thin', 'tied', 'accused', 'adventure', 'argue', 'assessment', 'atmosphere', 'awful',
  'bedroom', 'belief', 'bound', 'breaks', 'carefully', 'cats', 'choices', 'closing',
  'colorado', 'colors', 'contrast', 'courses', 'courts', 'donald', 'drew', 'element',
  'elsewhere', 'establish', 'extension', 'files', 'founder', 'gear', 'georgia', 'hills',
  'hitting', 'increases', 'infrastructure', 'jason', 'locations', 'loose', 'machines', 'moral',
  'offensive', 'package', 'pointed', 'poverty', 'processes', 'processing', 'qualified', 'railway',
  'reaching', 'ridiculous', 'sensitive', 'server', 'shock', 'soldier', 'superior', 'supporters',
  'thick', 'threw', 'tons', 'transition', 'violent', 'voters', 'wash', 'acid',
  'actress', 'administrative', 'alan', 'alongside', 'angel', 'anxiety', 'babies', 'bars',
  'bonus', 'charity', 'clients', 'compare', 'contained', 'cooking', 'covering', 'curious',
  'directors', 'discovery', 'discussed', 'duke', 'egypt', 'encourage', 'enforcement', 'featuring',
  'finals', 'flash', 'formal', 'formula', 'fort', 'governments', 'gray', 'gross',
  'horses', 'hungry', 'informed', 'innocent',
];

// Filter obviously non-standard entries so anchor words stay clean and
// dictionary-like (misspellings/slang/profanity/technical tokens).
const NON_STANDARD_WORDS = new Set([
  // Common misspellings / contraction-stripped forms.
  'dont', 'thats', 'lets', 'gonna', 'wanna', 'gotta', 'kinda', 'haha',
  // Technical tokens.
  'http',
  // Profanity / explicit terms.
  'bitch', 'bullshit', 'damn', 'fucked', 'hell', 'porn',
]);

function isUsableWord(word) {
  return /^[a-z]+$/.test(word) && word.length >= 3 && !NON_STANDARD_WORDS.has(word);
}

const BASE_WORDS = [...new Set([...CURATED_WORDS, ...DICTIONARY_WORDS]
  .map(w => String(w || '').trim().toLowerCase())
  .filter(isUsableWord)
)];

let libraryWords = [];
let libraryWordsPromise = null;

async function loadLibraryWords() {
  if (libraryWords.length) return libraryWords;
  if (libraryWordsPromise) return libraryWordsPromise;

  const patterns = ['????', '?????', '??????', '???????'];
  libraryWordsPromise = Promise.all(
    patterns.map(sp =>
      fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(sp)}&max=200`)
        .then(r => (r.ok ? r.json() : []))
        .catch(err => {
          console.warn(`Could not load Datamuse library words for pattern "${sp}".`, err);
          return [];
        })
    )
  )
    .then(groups => {
      const merged = groups.flat().map(x => String(x.word || '').toLowerCase());
      libraryWords = [...new Set(merged.filter(isUsableWord))];
      return libraryWords;
    })
    .catch(() => [])
    .finally(() => {
      libraryWordsPromise = null;
    });

  return libraryWordsPromise;
}

function getWordPool() {
  return libraryWords.length ? [...BASE_WORDS, ...libraryWords] : BASE_WORDS;
}

// ─────────────────────────────────────────────────────────
// Seeded PRNG (splitmix32)
// ─────────────────────────────────────────────────────────
function seededRng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x9e3779b9) >>> 0;
    let t = Math.imul(s ^ (s >>> 16), 0x21f0aaad) >>> 0;
    t = Math.imul(t ^ (t >>> 15), 0x735a2d97) >>> 0;
    return ((t ^ (t >>> 15)) >>> 0) / 4294967296;
  };
}

function normalizePracticeGameId(gameId) {
  const parsed = Number.parseInt(String(gameId || '').trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  const latestPastPuzzle = Math.max(1, getPuzzleNumber() - 1);
  return Math.min(parsed, latestPastPuzzle);
}

function createPracticeGameId() {
  const latestPastPuzzle = Math.max(1, getPuzzleNumber() - 1);
  return 1 + Math.floor(Math.random() * latestPastPuzzle);
}

function getDateFromPuzzleNumber(puzzleNumber) {
  const dayNum = Math.max(1, Number.parseInt(puzzleNumber, 10) || 1);
  const date = new Date('2025-01-01T00:00:00');
  date.setDate(date.getDate() + dayNum - 1);
  return date;
}

function getDailyPairForDate(date) {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const rng = seededRng(seed);
  return getRandomPair(rng);
}

function getDailyPairForPuzzleNumber(puzzleNumber) {
  return getDailyPairForDate(getDateFromPuzzleNumber(puzzleNumber));
}

/**
 * Returns today's [startWord, endWord] pair, deterministically seeded by date.
 * All players on the same calendar day receive the same pair.
 */
function getDailyPair() {
  return getDailyPairForDate(new Date());
}

function getPracticePair(gameId) {
  const puzzleNumber = normalizePracticeGameId(gameId) || createPracticeGameId();
  return getDailyPairForPuzzleNumber(puzzleNumber);
}

function getRandomPair(rng = Math.random) {
  const words = getWordPool();
  const idx1 = Math.floor(rng() * words.length);
  let idx2;
  do { idx2 = Math.floor(rng() * words.length); } while (idx2 === idx1);
  return [words[idx1], words[idx2]];
}

/**
 * Returns the day number since a fixed epoch (2025-01-01) for puzzle numbering.
 */
function getPuzzleNumber() {
  const epoch = new Date('2025-01-01');
  const now = new Date();
  return Math.max(1, Math.floor((now - epoch) / 86400000) + 1);
}
