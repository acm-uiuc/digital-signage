
import { XMLParser } from 'fast-xml-parser';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';


interface Paper {
    title: string;
    authors: string[];
    summary: string;
    url_abstract: string;
    url_pdf: string;
}

const CS_CATEGORIES = [
    { id: 'cs.AI', name: 'Artificial Intelligence' },
    { id: 'cs.CL', name: 'Computation and Language' },
    { id: 'cs.DC', name: 'Distributed Computing' },
    { id: 'cs.CV', name: 'Computer Vision' },
    { id: 'cs.LG', name: 'Machine Learning' },
    { id: 'cs.CR', name: 'Cryptography and Security' },
    { id: 'cs.DB', name: 'Databases' },
    { id: 'cs.DS', name: 'Data Structures and Algorithms' },
    { id: 'cs.HC', name: 'Human-Computer Interaction' },
    { id: 'cs.IR', name: 'Information Retrieval' },
    { id: 'cs.PL', name: 'Programming Languages' },
    { id: 'cs.RO', name: 'Robotics' },
    { id: 'cs.SE', name: 'Software Engineering' },
];

export default async function PaperOfTheDay() {
    try {
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
        const category = CS_CATEGORIES[dayOfYear % CS_CATEGORIES.length];

        const query = `search_query=cat:${category.id}&sortBy=lastUpdatedDate&sortOrder=descending&max_results=50`;
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
            throw new Error("No papers found in this category.");
        }

        const randomEntry = entries[Math.floor(Math.random() * entries.length)];

        const authors = Array.isArray(randomEntry.author)
            ? randomEntry.author.map((a: { name: string }) => a.name)
            : [randomEntry.author.name];

        const paper: Paper = {
            title: randomEntry.title,
            summary: randomEntry.summary.trim(),
            url_abstract: randomEntry.id,
            url_pdf: randomEntry.id.replace('/abs/', '/pdf/') + '.pdf',
            authors: authors,
        };

        return (
            <>
                <h1 className="text-2xl font-extrabold text-white text-center mb-2">Featured Paper</h1>
                <div className="mr-2 ml-2 p-3 bg-slate-700 rounded-lg h-full flex flex-col text-white overflow-hidden line-clamp-3 text-ellipsis">
                    <h2 className="text-sm font-bold text-acmblue-200 mb-1">{category.name}</h2>
                    <h3 className="text-md font-bold leading-tight mb-2">{paper.title}</h3>
                    <p className="text-xs text-gray-400 mb-3 italic">
                        {paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? ' et al.' : ''}
                    </p>
                    <p className="flex-grow text-sm text-gray-300 overflow-hidden text-ellipsis line-clamp-3">
                        <Latex>{paper.summary}</Latex>
                    </p>
                    <a
                        href={paper.url_abstract}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 bg-acmblue-500 hover:bg-acmblue-600 text-white font-bold py-2 rounded transition-colors duration-300"
                    >
                        {paper.url_abstract}
                    </a>
                </div>
            </>
        );

    } catch (error: unknown) {
        console.error("Failed to fetch daily paper:", error);
        return (
            <div className="p-4 bg-gray-800 rounded-lg h-full flex flex-col text-white items-center justify-center">
                <p className="text-center text-red-400">Could not load paper.</p>
            </div>
        );
    }
}   