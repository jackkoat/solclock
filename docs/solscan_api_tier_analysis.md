# Solscan API Free vs Premium: Endpoints, Rate Limits, CU Costs, and Usage Strategies

## Executive Summary

Solscan’s API offering is structured around a Free tier and multiple Pro subscription levels, with an explicit migration in progress from earlier API versions to a unified Pro API v2.0. The Free tier advertises substantial aggregate limits—10,000,000 Computing Units (C.U) per month and 1,000 requests per 60 seconds—but the publicly documented scope of what “Public endpoints” cover is limited. By contrast, Pro API v2.0 publishes a comprehensive endpoint catalog across Accounts, Tokens, Transactions, Blocks, NFTs, and Monitoring. Each v2.0 endpoint carries a published cost of 100 C.U per request, which makes capacity planning straightforward: maximum requests per month equal the tier’s C.U monthly allowance divided by 100 C.U per endpoint call.[^1][^2]

Several important caveats shape how teams should plan consumption. First, token price and market capitalization data in the Pro API carry a documented three-minute delay, introduced to improve reliability. Second, historical coverage windows vary by dataset: transfer endpoints cover approximately three years of history (to July 2021), balance change data is available for six months, and DeFi activities are limited to six months. Third, Solscan does not support testnet and has no plans to do so. These constraints affect near real-time price use cases, backfilling strategies, and any pipeline that assumes testnet parity for staging.[^3]

Migrating to Pro API v2.0 changes both coverage and consumption patterns. Historically used v1.0 endpoints—such as account/solTransfers, account/splTransfers, and transaction/{signature}—map to consolidated v2.0 endpoints (e.g., /account/transfer, /transaction/details). Because v2.0 standardizes cost at 100 C.U per endpoint call, teams should revise rate and volume planning around this fixed cost model.[^2][^9][^10][^11]

For teams constrained to the Free tier or choosing to minimize Pro costs, the most effective strategies are to cache aggressively, use pagination and server-side aggregation to reduce call volume, and pre-compute common metrics. Where Solscan’s Pro API features are not strictly necessary—especially for raw on-chain reads—public Solana Remote Procedure Call (RPC) methods are a practical alternative for retrieving accounts, transactions, and program interactions, provided teams accept the operational burden of scaling an indexing stack.[^13]

To orient decision-making, Table 1 offers a one-page comparison of Solscan’s published tiers and headline limits. The remainder of the report details endpoint coverage, historical windows, rate-limit dynamics, migration mapping, and implementation patterns that stretch Free-tier capacity while controlling Pro consumption.

To illustrate these differences at a glance, Table 1 synthesizes the tier structure, headline limits, and pricing.

Table 1. Solscan API tiers vs key limits and pricing

| Tier                     | C.U / month | Requests / 60 sec | Monthly price (current) | Notes                                                                 |
|--------------------------|-------------|-------------------|-------------------------|-----------------------------------------------------------------------|
| Free API                 | 10,000,000  | 1,000             | Free                    | Attribution required; Public endpoints only; exact endpoint list not documented.[^1] |
| Pro Level 2              | 150,000,000 | 1,000             | $129.35                 | Pro endpoints; parsed, real-time data; dedicated developer support.[^1][^2] |
| Pro Level 3              | 500,000,000 | 2,000             | $259.35                 | Higher throughput; Pro endpoints as above.[^1][^2]                    |
| Pro Level 4              | 1,500,000,000 | 3,000           | $714.35                 | Highest standard tier; Pro endpoints as above.[^1][^2]                |
| Enterprise               | Contact     | Contact           | Contact                 | Custom limits and terms.[^2]                                          |

The Free tier’s headline limits are generous, but the absence of a documented, comprehensive Public endpoint list creates uncertainty. Teams should plan for staged adoption: prototype with the Free tier for basic reads, confirm what data is available via Public endpoints, and then migrate specific use cases to Pro v2.0 where predictable parsed data, richer coverage, and SLAs are required.[^1][^4]

---

## Scope, Methodology, and Source Reliability

This analysis focuses on eight endpoint categories that cover the most common builder needs on Solana: token metadata and basic info; transaction data; block data; account data; network statistics; token price data; trending tokens; and token holders/transfers. We reviewed official plan pages and pricing for tier definitions and limits, the Pro API v2.0 reference hub for endpoint coverage, and the endpoint migration notes for v1.0-to-v2.0 mapping. We also incorporated FAQ disclosures on data delays, historical coverage, and testnet support. Where specific endpoint pages were not fully retrievable, we triangulated behavior via the v2.0 endpoint list and migration mapping.[^1][^2][^3][^5][^6]

Two reliability considerations are noteworthy. First, Solscan’s public materials emphasize the Pro API and v2.0 migration, while the explicit list of Free-tier Public endpoints and their precise per-endpoint limits are not comprehensively published. Second, the documentation references a three-minute delay for token price and market cap and enumerates historical windows for other datasets; these constraints materially affect design choices for dashboards, alerting, and backfills. We note these gaps explicitly and propose pragmatic mitigations.[^1][^3][^4]

---

## API Access Model and Tier Limits

Solscan’s Free tier provides a large aggregate monthly C.U allowance and a high requests-per-minute ceiling, but it is tied to “Public endpoints,” whose full catalog is not publicly detailed. Pro tiers explicitly unlock the published v2.0 endpoint catalog across major data domains and provide additional guarantees around data quality and support.[^1][^2]

Table 2 summarizes the core quotas by tier.

Table 2. Quotas by tier

| Tier                     | C.U / month  | Requests / 60 sec | Monthly price (current) | Access scope                            |
|--------------------------|--------------|-------------------|-------------------------|------------------------------------------|
| Free API                 | 10,000,000   | 1,000             | Free                    | Public endpoints (list not fully documented).[^1][^4] |
| Pro Level 2              | 150,000,000  | 1,000             | $129.35                 | Pro endpoints (parsed, real-time).[^1][^2] |
| Pro Level 3              | 500,000,000  | 2,000             | $259.35                 | Pro endpoints (higher throughput).[^1][^2] |
| Pro Level 4              | 1,500,000,000 | 3,000            | $714.35                 | Pro endpoints (highest standard tier).[^1][^2] |
| Enterprise               | Contact      | Contact           | Contact                 | Custom arrangement.                      |

Solscan discloses a migration of Pro API v1.0 endpoints to v2.0, accompanied by a consolidation of functionality. For example, separate SOL and SPL transfer endpoints are unified under /account/transfer, and legacy transaction detail paths are consolidated under /transaction/details. This simplifies consumption and aligns with a uniform cost model.[^2][^9][^10][^11]

### Free Tier (Public Endpoints)

The Free tier lists generous aggregate limits of 10,000,000 C.U per month and 1,000 requests per 60 seconds, with attribution required. However, Solscan does not publish a comprehensive list of Public endpoints or their per-endpoint limits in the referenced materials. The Public API documentation exists but does not enumerate the endpoints in the sources we reviewed. Practically, this means teams should validate Free-tier coverage empirically for their specific needs, especially for token metadata, account transfers, and basic chain stats, before committing to architectural assumptions.[^1][^4]

### Pro API (Levels 2–4 and Enterprise)

Pro tiers provide access to a documented v2.0 endpoint catalog spanning Accounts, Tokens, NFTs, Transactions, Blocks, and Monitoring. All v2.0 endpoints carry a base cost of 100 C.U per request. The published plan limits range from 150,000,000 to 1,500,000,000 C.U per month, with request ceilings from 1,000 to 3,000 per 60 seconds. Pro plans include access to parsed, real-time data and dedicated developer support. Enterprise arrangements are available for custom needs.[^1][^2][^6]

---

## Endpoints by Category: Free vs Premium Mapping

This section maps the most commonly used endpoint categories to the documented Pro v2.0 endpoints, notes CU costs, and clarifies the Free-tier status. Where documentation was not retrievable or not explicit, we indicate that explicitly.

Table 3. Endpoint matrix by category (Pro v2.0)

| Category                     | Endpoint (Pro v2.0)                    | Base CU | Free-tier status             |
|-----------------------------|----------------------------------------|---------|------------------------------|
| Token metadata and basic    | /token/meta                            | 100     | Not documented (assume Pro).[^2] |
| Token metadata and basic    | /token/list                            | 100     | Not documented (assume Pro).[^2] |
| Token price data            | /token/price                           | 100     | Not documented (assume Pro).[^2][^3] |
| Trending tokens             | /token/trending                        | 100     | Not documented (assume Pro).[^2] |
| Token holders/transfers     | /token/holders                         | 100     | Not documented (assume Pro).[^2] |
| Token holders/transfers     | /token/transfer                        | 100     | Not documented (assume Pro).[^2] |
| Token holders/transfers     | /token/defi/activities                 | 100     | Not documented (assume Pro).[^2] |
| Token markets               | /token/markets                         | 100     | Not documented (assume Pro).[^2] |
| Transaction data            | /transaction/last                      | 100     | Not documented (assume Pro).[^2] |
| Transaction data            | /transaction/details                   | 100     | Not documented (assume Pro).[^2][^10] |
| Transaction data            | /transaction/actions                   | 100     | Not documented (assume Pro).[^2] |
| Block data                  | /block/last                            | 100     | Not documented (assume Pro).[^2] |
| Block data                  | /block/transactions                    | 100     | Not documented (assume Pro).[^2] |
| Block data                  | /block/detail                          | 100     | Not documented (assume Pro).[^2] |
| Account data                | /account/transfer                      | 100     | Not documented (assume Pro).[^2][^9] |
| Account data                | /account/token-accounts                | 100     | Not documented (assume Pro).[^2] |
| Account data                | /account/transactions                  | 100     | Not documented (assume Pro).[^2] |
| Account data                | /account/balance_change                | 100     | Not documented (assume Pro).[^2] |
| Account data                | /account/defi/activities               | 100     | Not documented (assume Pro).[^2] |
| Account data                | /account/stake                         | 100     | Not documented (assume Pro).[^2] |
| Account data                | /account/detail                        | 100     | Not documented (assume Pro).[^2] |
| Account data                | /account/exportTransactions            | 100     | Not documented (assume Pro).[^2] |
| Account data                | /account/reward/export                 | 100     | Not documented (assume Pro).[^2] |
| Monitoring                  | /monitor/usage                         | 100     | Not documented (assume Pro).[^2] |
| NFTs                        | /nft/activities                        | 100     | Not documented (assume Pro).[^2] |
| NFTs                        | /nft/collection/items                  | 100     | Not documented (assume Pro).[^2] |
| NFTs                        | /nft/collection/lists                  | 100     | Not documented (assume Pro).[^2] |
| NFTs                        | /nft/news                              | 100     | Not documented (assume Pro).[^2] |

Across these categories, the Pro v2.0 catalog is explicit and the CU cost per endpoint is uniform. By contrast, the precise Free-tier endpoint coverage is not enumerated in the sources we reviewed; treat Free-tier availability as unknown unless verified directly against the Public API docs.[^1][^2][^4][^6]

### Token Metadata and Basic Info

Solscan’s v2.0 Token endpoints include /token/meta for token metadata and /token/list for retrieving lists of tokens. The published documentation indicates these are part of the Pro API and each call costs 100 C.U. Public documentation does not confirm Free-tier access for these endpoints.[^2][^15]

To make the documentation’s reality tangible, the following image captures the official Token List endpoint reference used by teams planning token discovery and ranking features.

![Solscan v2.0 Token List endpoint documentation snapshot](/workspace/browser/screenshots/solscan_token_list_api_doc.png)

The significance of this is twofold. First, token metadata and token lists are foundational for enrichment, ranking, and discovery; without guaranteed Free-tier access, production-grade token workflows typically require Pro. Second, because the endpoint is paginated and constrained to specific sort options, downstream systems must design for stable sort orders and caching to avoid thrash when ranking by market cap or holder counts.[^2][^15]

### Token Price Data

The /token/price endpoint is listed among Pro v2.0 Token endpoints with a 100 C.U cost. The FAQ further clarifies that token price and market cap data carry a three-minute delay. This delay is acceptable for dashboards and many analytics use cases, but it is generally incompatible with arbitrage or sub-minute trading signals. Teams should architect price-sensitive features with delayed data in mind or complement with additional sources if needed.[^2][^3]

### Trending Tokens

Trending tokens are exposed via /token/trending (100 C.U). As with other Token endpoints, Free-tier availability is not confirmed in the sources reviewed. Practically, this implies that any production pipeline relying on trending signals should either integrate Pro access or build its own scoring model using raw on-chain data.[^2]

### Token Holders and Transfers

For token-level analytics, v2.0 exposes /token/holders and /token/transfer. While these provide powerful token-centric views, many teams can approximate holders distribution and transfer activity using account-level calls and RPC reads. When high-fidelity token aggregates or cross-program attribution are required, the Pro endpoints’ parsed outputs reduce engineering complexity substantially.[^2]

### Transaction Data

Pro v2.0 documents /transaction/details, /transaction/last, and /transaction/actions. The details endpoint returns Solscan-parsed outputs, including SOL and token balance changes, parsed instructions, programs involved, status, compute units consumed, and more. This rich parsing saves significant post-processing. Free-tier availability is not confirmed in the reviewed sources.[^2][^10]

### Block Data

Block-level queries are covered by /block/last, /block/transactions, and /block/detail. These endpoints standardize access to chain progress and block contents with a uniform 100 C.U per call. Again, Free-tier coverage is not documented; plan accordingly for production needs.[^2]

### Account Data

The account domain is broad and central to most analytics: /account/transfer, /account/token-accounts, /account/transactions, /account/balance_change, /account/defi/activities, /account/stake, /account/detail, and export variants. Historically, teams used separate SOL and SPL transfer endpoints; v2.0 consolidates these patterns, simplifying CU budgeting and code paths.[^2][^9]

### Network Statistics

No explicit “network statistics” endpoints were identified in the Pro v2.0 endpoint list. Where high-level chain metrics are needed, teams often aggregate lower-level data (e.g., block ranges, transaction samples) or rely on third-party datasets. This is an area where Free-tier Public endpoints—if sufficiently documented—might provide basic statistics, but the sources reviewed do not enumerate such coverage.[^2][^4]

---

## Detailed Endpoint Catalog (Pro API v2.0)

Solscan’s Pro v2.0 catalog organizes endpoints by domain. Each call costs 100 C.U, which makes monthly request capacity straightforward to compute. For example, Level 2’s 150,000,000 C.U monthly allowance equates to up to 1,500,000 v2.0 endpoint calls per month at 100 C.U per call, subject also to the per-60-second request limit.[^2][^6]

Table 4. Pro v2.0 endpoints and base CU cost

| Domain      | Endpoint                          | CU per call |
|-------------|-----------------------------------|-------------|
| Account     | /account/transfer                 | 100         |
| Account     | /account/token-accounts           | 100         |
| Account     | /account/defi/activities          | 100         |
| Account     | /account/balance_change           | 100         |
| Account     | /account/transactions             | 100         |
| Account     | /account/exportTransactions       | 100         |
| Account     | /account/stake                    | 100         |
| Account     | /account/detail                   | 100         |
| Account     | /account/reward/export            | 100         |
| Token       | /token/transfer                   | 100         |
| Token       | /token/defi/activities            | 100         |
| Token       | /token/markets                    | 100         |
| Token       | /token/list                       | 100         |
| Token       | /token/trending                   | 100         |
| Token       | /token/price                      | 100         |
| Token       | /token/holders                    | 100         |
| Token       | /token/meta                       | 100         |
| NFT         | /nft/news                         | 100         |
| NFT         | /nft/activities                   | 100         |
| NFT         | /nft/collection/lists             | 100         |
| NFT         | /nft/collection/items             | 100         |
| Transaction | /transaction/last                 | 100         |
| Transaction | /transaction/actions              | 100         |
| Transaction | /transaction/details              | 100         |
| Block       | /block/last                       | 100         |
| Block       | /block/transactions               | 100         |
| Block       | /block/detail                     | 100         |
| Monitoring  | /monitor/usage                    | 100         |

These endpoints reflect a stable v2.0 surface. When combined with the published tier limits, they enable deterministic capacity planning at build time.[^2][^6]

### Example: Transaction Detail

The /transaction/details endpoint returns a parsed transaction view, including SOL and token balance changes, instruction parsing, involved programs, signer information, status, compute units consumed, and priority fees. This reduces the need to re-parse raw transactions in your application and standardizes balance-change accounting, which is critical for multi-program flows. Access to this endpoint is part of the Pro API v2.0 catalog.[^10]

### Example: Token List

The /token/list endpoint supports ranking tokens by holders, market capitalization, or created time, with pagination. Because Pro endpoints have a fixed CU cost, token discovery pipelines can budget precisely: for example, a single pass to retrieve the top 10,000 tokens by market cap using a page size of 100 requires 100 calls (10,000 / 100), consuming 10,000 CU total.[^2][^15]

---

## Rate Limits and CU Budgeting

With v2.0 standardizing endpoint cost at 100 C.U, budgeting is arithmetic rather than guesswork. The maximum monthly calls equal the tier’s monthly C.U divided by 100. In practice, both C.U and request-per-minute ceilings constrain throughput, so designs must respect both dimensions.[^2]

Table 5 derives indicative monthly call capacity from published C.U limits.

Table 5. CU-to-calls capacity at 100 CU per endpoint

| Tier                    | C.U / month     | Indicative max v2.0 calls/month |
|-------------------------|-----------------|----------------------------------|
| Free                    | 10,000,000      | 100,000                          |
| Pro Level 2             | 150,000,000     | 1,500,000                        |
| Pro Level 3             | 500,000,000     | 5,000,000                        |
| Pro Level 4             | 1,500,000,000   | 15,000,000                       |

Because Free-tier endpoint coverage is not comprehensively documented, treat these figures as upper bounds rather than guarantees for Free usage. Teams should also verify how Free-tier attribution requirements affect integration patterns.[^1][^4]

---

## Endpoint Migration: V1.0 to V2.0

Solscan has published an endpoint migration map that consolidates legacy v1.0 endpoints into v2.0 equivalents. This reduces API surface complexity and aligns costs to the 100 C.U model.[^2]

Table 6. Migration map (selected)

| Data Category | v1.0 Endpoint(s)                          | v2.0 Endpoint                 |
|---------------|--------------------------------------------|-------------------------------|
| Account       | /account/solTransfers, /account/splTransfers | /account/transfer             |
| Account       | /account/tokens                            | /account/token-accounts       |
| Account       | /account/transactions                      | /account/transactions         |
| Account       | /account/exportTransactions                | /account/exportTransactions   |
| Account       | /account/stakeAccounts                     | /account/stake                |
| Token         | /token/holders                             | /token/holders                |
| Token         | /token/meta                                | /token/meta                   |
| Token         | /token/transfer                            | /token/transfer               |
| Token         | /token/list                                | /token/list                   |
| Transaction   | /transaction/{signature}                   | /transaction/details          |
| Block         | /block/{block}                             | /block/detail                 |
| Block         | /block/transactions                        | /block/transactions           |

New v2.0 endpoints without v1.0 equivalents include /account/defi/activities, /account/balance_change, /account/detail, /account/reward/export, /token/defi/activities, /token/markets, /token/trending, /token/price, /nft/*, and /monitor/usage, among others. Integrators should update client code, test for schema differences, and revise capacity plans to reflect the 100 C.U per call model.[^2]

---

## Best Practices for Maximizing Free Tier Usage

Given the uncertainties around Public endpoint scope, the most robust approach is to design for scarcity even when limits appear high. The following patterns stretch Free-tier capacity and avoid brittle dependencies on undocumented behavior:

- Aggressive caching at multiple layers. Cache token metadata and static lists for long periods; cache transaction and block responses for shorter, TTL-based windows; and cache derived aggregates to avoid repeated full scans. This is especially impactful for popular tokens and high-traffic accounts.[^14]
- Pagination discipline and windowed queries. Use page sizes that minimize call count while staying within timeouts. For account transfers or token holders, constrain time windows and page counts to the minimum needed for correctness.[^14]
- Server-side aggregation. Pre-compute metrics such as daily active senders, total transfer volume by token, or per-program invocation counts, and serve these from your backend to reduce repeated calls across clients.[^14]
- Backoff and adaptive polling. Align polling frequency to observed staleness tolerance and implement exponential backoff with jitter on 429 or 5xx responses to avoid synchronized retry storms.[^14]
- Observability and circuit breaking. Monitor request volumes, error codes, and effective data age. Use circuit breakers to degrade functionality gracefully when nearing Free-tier limits, falling back to last-known-good cached data until capacity resets.[^14]
- Shard and schedule workloads. Distribute non-urgent jobs across time to smooth demand and avoid bursts that collide with per-60-second ceilings. Nightly backfills should be spaced to respect both monthly C.U and RPS constraints.

These practices are not merely defensive; they directly translate to lower CU consumption under Pro plans, fewer error events, and better user experience under variable load.[^14]

---

## Alternatives for Premium-Required Features

When Pro features are gated or the economics of high-volume parsed data are unfavorable, teams can fall back to raw Solana RPC. Public RPC endpoints exist across Solana clusters, albeit with variable rate limits and reliability. For read-only use cases—retrieving accounts, transactions, and program interactions—this can be a workable path, provided you bring your own indexing, aggregation, and storage layers.[^13]

Table 7. Alternative approaches

| Feature area                 | Solscan Pro endpoint(s)                 | RPC alternative (conceptual)                | Trade-offs                                                                                  |
|-----------------------------|-----------------------------------------|---------------------------------------------|---------------------------------------------------------------------------------------------|
| Transaction details         | /transaction/details                    | getTransaction / getSignaturesForAddress    | You parse and normalize; no balance-change shortcuts; more infra and maintenance.          |
| Account transfers           | /account/transfer                       | getSignaturesForAddress + parsing           | Greater engineering effort; you must implement paging and reorg-aware logic.               |
| Token metadata              | /token/meta                             | On-chain token accounts and associated metadata | You must resolve metadata and cache; risk of incomplete or inconsistent sources.          |
| Token holders               | /token/holders                          | Enumerate token accounts by mint            | Expensive scan; requires careful pagination and storage.                                    |
| Block contents              | /block/transactions, /block/detail      | getBlock                                    | RPC rate limits apply; you aggregate across slots and handle reorgs yourself.              |
| DeFi activities             | /token/defi/activities, /account/defi/activities | Program-specific RPC calls + indexing     | You need protocol-aware decoders; maintenance burden across protocol changes.              |

If you choose the RPC route, pay attention to cluster selection and public endpoint availability. Devnet and testnet exist for non-production testing, but Solscan’s Pro API does not support testnet; plan for mainnet-only parity where necessary.[^3][^13]

---

## Operational Considerations: Data Delays, Coverage, and Testnet

Several operational realities should inform system design:

- Data delays for token price and market cap. The Pro API delivers these with a three-minute delay to improve reliability. This is generally sufficient for dashboards and analytics, but not for sub-minute trading signals or latency-sensitive arbitrage.[^3]
- Historical coverage windows. Transfer endpoints cover roughly three years (to July 2021), balance changes six months, and DeFi activities six months. Plan backfills accordingly and avoid assumptions about deep historical coverage outside these windows.[^3]
- Testnet support. Solscan does not support testnet and has no plans to do so. Any testing strategy requiring testnet parity must rely on other tools or RPC providers, while production analytics should assume mainnet-only parity with Solscan’s explorer data.[^3]
- Attribution. Free-tier usage requires attribution. Review branding and linking guidelines to ensure compliance, particularly if you aggregate Solscan data in public-facing applications.[^1]

These constraints are not blockers, but they do demand explicit architectural decisions: when to accept delayed prices, how far back to plan historical backfills, and how to stage tests without testnet support.

---

## Appendix: Example Requests and Responses

This appendix demonstrates representative v2.0 endpoint usage patterns to guide implementation and testing.

Account Transfer (Pro v2.0)

- Purpose: Retrieve transfer activity for an account (SOL and SPL), consolidated in v2.0.
- Method and path: GET /v2.0/account/transfer
- Key parameters: address (account to query); optional filters (e.g., before/until for pagination, limit controls).
- Notes: Unified successor to v1.0 solTransfers and splTransfers; each call costs 100 C.U.[^2][^9]

Transaction Detail (Pro v2.0)

- Purpose: Retrieve a parsed transaction with balance changes, instructions, programs, status, and fees.
- Method and path: GET /v2.0/transaction/details
- Required parameters: tx (transaction signature).
- Response highlights: sol_bal_change (per-address pre/post/change), token_bal_change, programs_involved, parsed_instructions, signer, status (1 success, 0 error), compute_units_consumed, priority_fee, log_message, fee, reward.
- Notes: A 429 response indicates rate limit exceeded; implement backoff and caching. Parsed data reduces downstream processing needs.[^10][^11]

Token List (Pro v2.0)

- Purpose: Enumerate tokens, optionally ranked by market cap, holders, or created time.
- Method and path: GET /v2.0/token/list
- Key parameters: sort_by (holder, market_cap, created_time), sort_order (asc, desc), page, page_size (permitted values include common denominators like 10, 20, 50, 100).
- Notes: Page size options are constrained; design for stable sorting and pagination boundaries. Each call costs 100 C.U.[^2][^15]

Example response structure snippets (abridged):

- Account Transfer: A list of transfers with direction, amount, mint (if applicable), signature, and timestamp.
- Transaction Detail: Fields as listed in the reference, including nested arrays for balance changes and instructions.
- Token List: Array of token metadata entries with price, market cap, holder counts, and sorting fields.

These examples underscore a consistent design: predictable pagination patterns, explicit sorting fields, and a uniform 100 C.U per call. This enables tight control of consumption via server-side aggregation, caching, and job scheduling.[^2][^9][^10][^15]

---

## References

[^1]: API Plans - Solscan. https://solscan.io/apis  
[^2]: Pro API Endpoints - Solscan Documentation. https://docs.solscan.io/api-access/pro-api-endpoints  
[^3]: Solscan Pro API FAQ. https://docs.solscan.io/api-access/solscan-pro-api-faq  
[^4]: Public API | Solscan Documentation. https://docs.solscan.io/browsing-the-site/resources/public-api  
[^5]: Solscan Pro API Docs v2.0 (Overview). https://pro-api.solscan.io/pro-api-docs/v2.0  
[^6]: API Endpoints Reference (Pro) - Solscan Pro API v2.0. https://pro-api.solscan.io/pro-api-docs/v2.0/reference  
[^9]: v2.0 Account Transfer - Solscan Pro API Docs. https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-account-transfer  
[^10]: v2.0 Transaction Detail - Solscan Pro API Docs. https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-transaction-detail  
[^11]: v2.0 Account Metadata (Multi) - Solscan Pro API Docs. https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-account-metadata-multi  
[^13]: Clusters and Public RPC Endpoints - Solana. https://solana.com/docs/references/clusters  
[^15]: v2.0 Token List - Solscan Pro API Docs. https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-token-list

---

## Information Gaps

- Free-tier (Public) endpoint catalog and per-endpoint rate limits are not comprehensively published in the reviewed sources. Treat Free-tier coverage as unknown unless empirically validated.
- Public API endpoint documentation exists, but detailed endpoint lists and limits were not retrievable in the reviewed sources.
- Network statistics endpoints are not clearly defined in the Pro v2.0 endpoint catalog; verify with Solscan or supplement via custom aggregation.
- Detailed monthly price breakdown by Pro level was present at a high level, but monthly versus discounted price specifics may require direct confirmation from Solscan for the most current figures.
- Token price endpoint parameters were not fully extracted; consult the v2.0 token/price reference directly for complete parameterization.[^1][^2][^3][^4]