# technical-interests.md - Vinayak's Technical World

> This file tells the agentic content system what topics to search for,
> what Vinayak has genuine depth in, and what his actual opinions are.
> Use this to filter trending content, identify relevant topics, and
> generate posts that have a real point of view - not just awareness.

---

## How to Use This File (For the Agentic System)

When searching for content opportunities, look for:
- Trending GitHub repos, releases, or papers in the domains listed below
- Recent launches, funding news, or pivots in the startup/VC world
- Technical debates or comparisons (language X vs Y, framework A vs B)
- New research papers or technical blogs in AI/ML, distributed systems, or game dev
- Major product launches or paradigm shifts in any of the listed domains

Filter results against this file: if a trending topic maps to a domain Vinayak has depth in OR has a strong opinion on, it's a viable content option. Surface 3–4 options. Let him choose.

---

## Primary Technical Domains (Deep Knowledge)

### AI / ML Systems
Not surface-level AI interest. Genuine depth in:
- LLM architecture and inference - how models actually work, not just how to prompt them
- Agentic systems and their real trade-offs (see opinions section)
- RAG pipelines - built with LangChain, ChromaDB, Ollama
- Federated learning and distributed inference - was exploring a research paper here
- AI at the infrastructure layer, not the application layer
- KV caching, speculative decoding, distributed training across clusters
- Hardware-AI intersection - how inference is moving to edge, different chip stacks
- Recent pre-training research, architecture papers, efficiency breakthroughs

Content trigger: anything that is a genuine technical advancement or a sharp debate in AI infra, inference efficiency, or distributed ML. Not "AI is changing everything" takes - specific, architectural, interesting.

### Distributed Systems and Backend
- Distributed systems design - how systems behave at scale, how you design for failure
- Federated systems and distributed inference
- Backend architecture - Go, Python (FastAPI/Django), Node
- Has a take on Go getting popular (positive) and Django being overused (skeptical)
- JVM internals - studied deeply, finds it genuinely fascinating
- Low-level design and SOLID principles - cares about what good software actually looks like
- Edge computing and HFT systems - following advancements here

Content trigger: Go vs other languages, distributed system design decisions, backend architecture debates, anything interesting in compiler infrastructure or language design (LLVM, Zig, Haskell).

### Game Development
Passion domain. Not a business focus right now but genuine love here:
- Unity (primary) and Godot - extensive experience
- Custom physics systems - wrote physics engines from scratch
- Rendering internals - OpenGL, WebGL, how rendering engines work
- Procedural generation - cellular automata, wave function collapse, Perlin noise
- Game architecture - retention loops, game economies, on-chain assets
- Intersection of games and simulation - running real-world simulations in game engines, hardware-game integrations
- AI in game dev - Unity's inbuilt AI launch is exactly the kind of thing worth covering

Content trigger: game engine launches, procedural gen research, game-as-simulation ideas, interesting indie game tech, Unity vs Godot debates.

### Low-Level Programming and Systems
- C/C++ - extensive, used for image processing and custom engines
- Zig - following as a potential C/C++ successor, interested in the Zig vs Rust debate
- Rust - knows it, has opinions on where it wins and where it doesn't
- Compiler architecture - raised a PR for LLVM/Fortran, familiar with compiler infra
- Image processing and steganography - built a resilient invisible watermarking library, understands signal processing at this level
- Memory management, performance engineering, systems-level thinking

Content trigger: Zig vs Rust vs C++ comparisons, compiler improvements, low-level performance debates, anything in systems programming that's genuinely new.

### Web3 / DeFi
Built in this space, won ETHGlobal, designed a DeFi protocol from scratch. Has a grounded (not maximalist) view:
- DeFi protocols - lending, AMMs, yield optimizers, interest rate models
- Cross-chain systems - EVM and non-EVM chains, cross-chain swaps
- Tokenomics and on-chain game economies
- Flow, Solidity, Cadence - has built in all of these

Content trigger: genuine innovation in DeFi primitives, interesting protocol designs, cross-chain infrastructure, anything that represents real progress rather than hype. Not interested in price speculation content.

---

## Startup and Tech World (Content Domain)

Beyond pure technical topics, this is equally important for content:

### Startup Ecosystem
- YC batches - new companies, interesting ideas, funding news
- a16z, Sequoia, other major VC moves
- Interesting founders and what they're building
- Startup ideas that solve a real problem in an elegant way (the unified workspace YC company is a good example - Slack + Docs + Meet all in one AI-native platform)
- Indian startup ecosystem - MDG Space lineage (Fampay, Tensorfuse, Repello AI, Powerplay)
- B2B SaaS, infrastructure plays, developer tools

Content trigger: any YC company launch that's interesting, funding rounds for companies in adjacent spaces, new accelerator deadlines (a16z speedrun, etc.), founder insights worth reacting to.

### AI and the Future of Work
Has actual opinions here, not generic takes:
- Software engineering jobs being disrupted - believes this is real and directional
- CP/DSA hiring culture having an expiry date
- Government and legacy institutions being slow to adopt AI (specific observation about India)
- The economic tension: AI could eliminate scarcity, but the world runs on scarcity, so something else will happen instead
- Humans staying relevant for a while, but the nature of relevance changing

Content trigger: AI job disruption data, new coding tools that change what developers do, anything that advances or challenges the "AI replaces software engineers" debate.

---

## Vinayak's Actual Opinions (For Content Voice)

These are not neutral takes. Use these when making content in his voice.

### On AI
AI will get dramatically better and more integrated. The disruption is real but will be throttled by economic and political forces - especially in places like India where government has no incentive to automate itself out of jobs. Software is at its peak and will suffer its own disruption. Humans stay relevant for a while, but the ceiling on what AI can do keeps rising. Scarcity is what drives human motivation - if AI eliminates scarcity, something else fills that role. Nobody knows what.

### On Web3
Web3 is genuinely great for finance and cross-border value transfer - sending money anywhere without intermediaries is a real innovation. It is not needed in most consumer applications. Decentralization is only valuable where centralization is actually the problem. Applying Web3 to things that don't need it is a waste of the technology. DeFi is the strongest use case. Most of the rest is hype.

### On Agentic Systems
The framing of "agentic systems" is mostly wrong. The right framing: build proper software, and use LLMs only where reasoning is genuinely needed. Determinism is the goal. Agents introduce non-determinism - which is sometimes necessary (writing, synthesis, judgment) and often unnecessary (everything else). The value of an LLM is the reasoning and generation capability. The rest of the system should be deterministic software around it. Purely agentic systems with long chains of LLM calls are fragile and hard to debug. Explainability matters. Use agents surgically.

### On Go vs Django
Go is getting popular for the right reasons - performance, simplicity, concurrency. Django is overused for things that don't need it. The choice of backend framework matters more than most people treat it.

### On Zig
Watching Zig closely. It may have a stronger case than Rust for certain systems programming use cases - simpler, more explicit, potentially more practical for low-level work. The Zig vs Rust debate is worth following.

### On the JVM
Genuinely fascinating piece of engineering. The way the JVM handles memory, JIT compilation, and platform abstraction is something more developers should understand at a deeper level.

### On Game Dev as Simulation
Games are underrated as simulation environments. The intersection of game engines and real-world simulation (hardware simulations, AI training environments, complex system modeling) is an area with a lot of unexplored potential.

---

## Content Themes (What Makes a Good Post for Vinayak)

A good content opportunity from this file is one where:
1. Something technically interesting just happened (launch, paper, debate, funding)
2. Vinayak has actual depth or a real opinion on it
3. There's a non-obvious angle - not just "X launched, here's what it does"
4. It connects to something broader: a trend, a tension, a shift in how things work

Bad content opportunities: generic AI news, price speculation, anything that requires no opinion, anything where the take is obvious.

---

## Quick Reference - Topics to Always Monitor

- GitHub trending (daily/weekly)
- ArXiv AI/ML papers (especially inference efficiency, distributed training, federated learning)
- HackerNews top posts (especially systems, languages, tools)
- YC new batch announcements and notable companies
- a16z / Sequoia blog posts and funding news
- Unity, Godot, Unreal Engine release notes and announcements
- Ethereum research forum (ethresear.ch) for DeFi/protocol innovation
- Go, Rust, Zig release notes and community debates
- Startup Twitter/X for founder takes worth reacting to
