import { XMLParser } from 'fast-xml-parser';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import QRCode from 'react-qr-code';

interface Paper {
    title: string;
    authors: string[];
    summary: string;
    url_abstract: string;
    url_pdf: string;
}

const THEMED_CATEGORIES = [
    {
        name: 'AI & Machine Learning',
        categories: ['cs.AI', 'cs.LG', 'cs.CV', 'cs.CL', 'cs.NE', 'cs.RO', 'cs.MA'],
    },
    {
        name: 'Theory & Algorithms',
        categories: ['cs.CC', 'cs.DS', 'cs.DM', 'cs.FL', 'cs.LO', 'cs.GT', 'cs.CG'],
    },
    {
        name: 'Systems & Hardware',
        categories: ['cs.AR', 'cs.DC', 'cs.NI', 'cs.OS', 'cs.PF', 'cs.SY'],
    },
    {
        name: 'Software & Programming',
        categories: ['cs.SE', 'cs.PL', 'cs.DB', 'cs.MS', 'cs.SC'],
    },
    {
        name: 'HCI & Applications',
        categories: ['cs.HC', 'cs.GR', 'cs.MM', 'cs.IR', 'cs.CY', 'cs.SI', 'cs.SD'],
    },
    {
        name: 'Security & Information Theory',
        categories: ['cs.CR', 'cs.IT'],
    },
    {
        name: 'Computational Science',
        categories: ['cs.CE', 'cs.NA'],
    },
    {
        name: 'Emerging & General CS',
        categories: ['cs.ET', 'cs.OH', 'cs.GL', 'cs.DL'],
    },
];


export default async function PaperOfTheDay() {
    try {
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);

        const theme = THEMED_CATEGORIES[dayOfYear % THEMED_CATEGORIES.length];
        const categoryId = theme.categories[Math.floor(Math.random() * theme.categories.length)];

        const query = `search_query=cat:${categoryId}&sortBy=lastUpdatedDate&sortOrder=descending&max_results=50`;
        const API_URL = `http://export.arxiv.org/api/query?${query}`;

        const response = await fetch(API_URL, { cache: 'no-store' });

        if (!response.ok) {
            throw new Error(`arXiv API responded with status: ${response.status}`);
        }

        const xmlText = await response.text();
        const parser = new XMLParser({ ignoreAttributes: false });
        const jsonObj = parser.parse(xmlText);

        const entries = jsonObj.feed?.entry;
        if (!entries || entries.length === 0) {
            throw new Error(`No papers found in category ${categoryId}.`);
        }

        const randomEntry = entries[Math.floor(Math.random() * entries.length)];

        const authors = Array.isArray(randomEntry.author)
            ? randomEntry.author.map((a: { name: string }) => a.name)
            : [randomEntry.author.name];

        const paper: Paper = {
            title: randomEntry.title.replace(/\s+/g, ' '),
            summary: randomEntry.summary.trim().replace(/\s+/g, ' '),
            url_abstract: randomEntry.id,
            url_pdf: randomEntry.id.replace('/abs/', '/pdf/') + '.pdf',
            authors: authors,
        };

        return (
            <>
                <h1 className="ml-5 text-2xl font-extrabold text-white mb-2">Featured Paper</h1>
                <div className="flex mr-5 ml-5 p-3 bg-slate-800 rounded-lg text-white mb-2">
                    <div className="flex flex-col flex-grow overflow-hidden pr-3">
                        <h2 className="text-sm font-bold text-acmblue-200 mb-1">{theme.name}</h2>
                        <h3 className="text-md font-bold leading-tight"><Latex>{paper.title}</Latex></h3>
                        <p className="text-xs text-gray-200 mb-2 italic">
                            {paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? ' et al.' : ''}
                        </p>
                        <p className="flex-grow text-sm text-white overflow-hidden text-ellipsis line-clamp-6">
                            <Latex>{paper.summary}</Latex>
                        </p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-center justify-center pl-3 border-l border-gray-700">
                        <a href={paper.url_pdf} target="_blank" rel="noopener noreferrer" title="Download PDF">
                            <QRCode
                                value={paper.url_pdf}
                                size={140}
                                fgColor="#ffffff"
                                bgColor="#1e293b"
                            />
                        </a>
                        <p className="text-xs text-gray-200 mt-2 text-center font-mono">
                            Scan to open PDF
                        </p>
                    </div>
                </div>
            </>
        );

    } catch (error: unknown) {
        console.error("Failed to fetch daily paper:", error);
        return (
            <div className="p-4 bg-gray-800 rounded-lg h-full flex flex-col text-white items-center justify-center">
                <p className="text-center text-red-400">Could not load paper.</p>
                {error instanceof Error && <p className="text-xs text-gray-500 mt-2">{error.message}</p>}
            </div>
        );
    }
}