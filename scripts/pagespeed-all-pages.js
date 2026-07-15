const fs = require("node:fs/promises");

const SITEMAP_URL = "https://b2bindustrial.in/sitemap.xml";
const API_KEY = process.env.PAGESPEED_API_KEY || "";
const OUTPUT_FILE = "pagespeed-report.csv";

const REQUEST_DELAY_MS = 1500;

const STRATEGIES = ["mobile", "desktop"];

const CATEGORIES = [
    "performance",
    "accessibility",
    "best-practices",
    "seo",
];

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeCsv(value) {
    if (value === null || value === undefined) {
        return "";
    }

    const text = String(value);

    if (text.includes(",") || text.includes('"') || text.includes("\n")) {
        return `"${text.replaceAll('"', '""')}"`;
    }

    return text;
}

function scoreToPercent(score) {
    return typeof score === "number" ? Math.round(score * 100) : "";
}

function getNumericValue(audits, auditName) {
    const value = audits?.[auditName]?.numericValue;

    return typeof value === "number" ? Math.round(value) : "";
}

function getDisplayValue(audits, auditName) {
    return audits?.[auditName]?.displayValue || "";
}

async function getSitemapUrls() {
    console.log(`Downloading sitemap: ${SITEMAP_URL}`);

    const response = await fetch(SITEMAP_URL, {
        headers: {
            "User-Agent": "B2BIndustrial-PageSpeed-Auditor/1.0",
        },
    });

    if (!response.ok) {
        throw new Error(
            `Could not download sitemap: ${response.status} ${response.statusText}`,
        );
    }

    const xml = await response.text();

    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
        .map((match) => match[1].trim())
        .filter(Boolean);

    return [...new Set(urls)];
}

function buildApiUrl(pageUrl, strategy) {
    const apiUrl = new URL(
        "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
    );

    apiUrl.searchParams.set("url", pageUrl);
    apiUrl.searchParams.set("strategy", strategy);

    for (const category of CATEGORIES) {
        apiUrl.searchParams.append("category", category);
    }

    if (API_KEY) {
        apiUrl.searchParams.set("key", API_KEY);
    }

    return apiUrl;
}

async function auditPage(pageUrl, strategy) {
    const apiUrl = buildApiUrl(pageUrl, strategy);

    const response = await fetch(apiUrl);

    if (!response.ok) {
        const errorBody = await response.text();

        throw new Error(
            `PageSpeed API returned ${response.status}: ${errorBody.slice(0, 300)}`,
        );
    }

    return response.json();
}

function createReportRow(pageUrl, strategy, result) {
    const lighthouse = result.lighthouseResult || {};
    const categories = lighthouse.categories || {};
    const audits = lighthouse.audits || {};

    return {
        url: pageUrl,
        strategy,
        finalUrl: lighthouse.finalUrl || pageUrl,
        fetchedAt: lighthouse.fetchTime || new Date().toISOString(),

        performance: scoreToPercent(categories.performance?.score),
        accessibility: scoreToPercent(categories.accessibility?.score),
        bestPractices: scoreToPercent(categories["best-practices"]?.score),
        seo: scoreToPercent(categories.seo?.score),

        fcpMs: getNumericValue(audits, "first-contentful-paint"),
        lcpMs: getNumericValue(audits, "largest-contentful-paint"),
        speedIndexMs: getNumericValue(audits, "speed-index"),
        totalBlockingTimeMs: getNumericValue(audits, "total-blocking-time"),
        cls: audits["cumulative-layout-shift"]?.numericValue ?? "",
        interactiveMs: getNumericValue(audits, "interactive"),

        fcp: getDisplayValue(audits, "first-contentful-paint"),
        lcp: getDisplayValue(audits, "largest-contentful-paint"),
        speedIndex: getDisplayValue(audits, "speed-index"),
        totalBlockingTime: getDisplayValue(audits, "total-blocking-time"),
        clsDisplay: getDisplayValue(audits, "cumulative-layout-shift"),

        status: "success",
        error: "",
    };
}

function createErrorRow(pageUrl, strategy, error) {
    return {
        url: pageUrl,
        strategy,
        finalUrl: "",
        fetchedAt: new Date().toISOString(),

        performance: "",
        accessibility: "",
        bestPractices: "",
        seo: "",

        fcpMs: "",
        lcpMs: "",
        speedIndexMs: "",
        totalBlockingTimeMs: "",
        cls: "",
        interactiveMs: "",

        fcp: "",
        lcp: "",
        speedIndex: "",
        totalBlockingTime: "",
        clsDisplay: "",

        status: "failed",
        error: error.message,
    };
}

async function saveCsv(rows) {
    const headers = [
        "url",
        "strategy",
        "finalUrl",
        "fetchedAt",
        "performance",
        "accessibility",
        "bestPractices",
        "seo",
        "fcpMs",
        "lcpMs",
        "speedIndexMs",
        "totalBlockingTimeMs",
        "cls",
        "interactiveMs",
        "fcp",
        "lcp",
        "speedIndex",
        "totalBlockingTime",
        "clsDisplay",
        "status",
        "error",
    ];

    const csvLines = [
        headers.join(","),
        ...rows.map((row) =>
            headers.map((header) => escapeCsv(row[header])).join(","),
        ),
    ];

    await fs.writeFile(OUTPUT_FILE, csvLines.join("\n"), "utf8");
}

async function main() {
    const urls = await getSitemapUrls();

    console.log(`Found ${urls.length} unique URLs.`);
    console.log(
        `Running ${urls.length * STRATEGIES.length} total PageSpeed audits.`,
    );

    if (!API_KEY) {
        console.warn(
            "Warning: PAGESPEED_API_KEY is not set. The API may enforce stricter limits.",
        );
    }

    const rows = [];
    let completed = 0;
    const total = urls.length * STRATEGIES.length;

    for (const pageUrl of urls) {
        for (const strategy of STRATEGIES) {
            completed += 1;

            console.log(
                `[${completed}/${total}] Testing ${strategy}: ${pageUrl}`,
            );

            try {
                const result = await auditPage(pageUrl, strategy);
                const row = createReportRow(pageUrl, strategy, result);

                rows.push(row);

                console.log(
                    `  Performance: ${row.performance} | Accessibility: ${row.accessibility} | SEO: ${row.seo}`,
                );
            } catch (error) {
                console.error(`  Failed: ${error.message}`);
                rows.push(createErrorRow(pageUrl, strategy, error));
            }

            await saveCsv(rows);
            await sleep(REQUEST_DELAY_MS);
        }
    }

    console.log(`Finished. Report saved to ${OUTPUT_FILE}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
