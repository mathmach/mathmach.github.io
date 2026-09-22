import urllib.request
import urllib.error
import json
import re
import ssl
import sys

REFERENCES = [
    {
        "id": "hevner_2004",
        "author": "Hevner et al. (2004)",
        "work": "Design Science in Information Systems Research",
        "url": "https://aisel.aisnet.org/misq/vol28/iss1/6",
        "keywords": ["Hevner", "Design Science in Information Systems Research"],
        "doi": "10.2307/25148625"
    },
    {
        "id": "peffers_2007",
        "author": "Peffers et al. (2007)",
        "work": "A Design Science Research Methodology for Information Systems Research",
        "url": "https://www.tandfonline.com/doi/abs/10.2753/MIS0742-1222240302",
        "keywords": ["Peffers", "Design Science Research Methodology"],
        "doi": "10.2753/MIS0742-1222240302"
    },
    {
        "id": "iso_15288",
        "author": "ISO/IEC/IEEE 15288:2023",
        "work": "Systems and software engineering — System life cycle processes",
        "url": "https://en.wikipedia.org/wiki/ISO/IEC_15288",
        "keywords": ["15288", "System life cycle processes", "ISO/IEC"],
        "doi": "10.1109/IEEESTD.2023.10123367"
    },
    {
        "id": "iso_25010",
        "author": "ISO/IEC 25010:2023",
        "work": "Product Quality Model (SQuaRE)",
        "url": "https://iso25000.com/index.php/en/iso-25000-standards/iso-25010",
        "keywords": ["25010", "ISO"],
        "doi": None
    },
    {
        "id": "boehm_1981",
        "author": "Barry Boehm (1981)",
        "work": "Software Engineering Economics (V&V)",
        "url": "https://archive.org/details/softwareengineer0000boeh",
        "keywords": ["Boehm", "Software engineering economics"],
        "doi": None
    },
    {
        "id": "pugh_1991",
        "author": "Stuart Pugh (1991)",
        "work": "Total Design: Integrated Methods for Successful Product Engineering",
        "url": "https://archive.org/details/totaldesigninteg0000pugh",
        "keywords": ["Pugh", "Total design"],
        "doi": None
    },
    {
        "id": "bertalanffy_1968",
        "author": "Ludwig von Bertalanffy (1968)",
        "work": "General System Theory",
        "url": "https://archive.org/details/generalsystemthe0000bert",
        "keywords": ["Bertalanffy", "General system theory"],
        "doi": None
    },
    {
        "id": "wiener_1948",
        "author": "Norbert Wiener (1948)",
        "work": "Cybernetics",
        "url": "https://en.wikipedia.org/wiki/Cybernetics:_Or_Control_and_Communication_in_the_Animal_and_the_Machine",
        "keywords": ["Wiener", "Cybernetics"],
        "doi": None
    },
    {
        "id": "checkland_1981",
        "author": "Peter Checkland (1981)",
        "work": "Systems Thinking, Systems Practice",
        "url": "https://en.wikipedia.org/wiki/Peter_Checkland",
        "keywords": ["Checkland", "Systems Thinking, Systems Practice"],
        "doi": None
    },
    {
        "id": "avizienis_2004",
        "author": "Avizienis et al. (2004)",
        "work": "Taxonomy of Dependable and Secure Computing",
        "url": "https://doi.org/10.1109/TDSC.2004.2",
        "keywords": ["Avizienis", "Dependable"],
        "doi": "10.1109/TDSC.2004.2"
    },
    {
        "id": "knuth_1976",
        "author": "Donald Knuth (1976)",
        "work": "Big Omicron and big Omega and big Theta",
        "url": "https://doi.org/10.1145/1008328.1008329",
        "keywords": ["Knuth", "Omicron", "Omega"],
        "doi": "10.1145/1008328.1008329"
    },
    {
        "id": "little_1961",
        "author": "John Little (1961)",
        "work": "A Proof for the Queuing Formula: L = lambda W",
        "url": "https://doi.org/10.1287/opre.9.3.383",
        "keywords": ["Little", "Queuing Formula"],
        "doi": "10.1287/opre.9.3.383"
    },
    {
        "id": "amdahl_1967",
        "author": "Gene Amdahl (1967)",
        "work": "Validity of the Single Processor Approach (Amdahl's Law)",
        "url": "https://doi.org/10.1145/1465482.1465560",
        "keywords": ["Amdahl", "Single Processor"],
        "doi": "10.1145/1465482.1465560"
    },
    {
        "id": "gustafson_1988",
        "author": "John Gustafson (1988)",
        "work": "Reevaluating Amdahl's Law",
        "url": "https://doi.org/10.1145/42411.42415",
        "keywords": ["Gustafson", "Amdahl"],
        "doi": "10.1145/42411.42415"
    },
    {
        "id": "gunther_usl",
        "author": "Neil J. Gunther (2008)",
        "work": "A General Theory of Computational Scalability Based on Rational Functions (USL)",
        "url": "https://arxiv.org/abs/0808.1431",
        "keywords": ["Gunther", "Scalability"],
        "doi": "10.48550/arXiv.0808.1431"
    },
    {
        "id": "martin_2000",
        "author": "Robert C. Martin (2000)",
        "work": "Design Principles and Design Patterns (SOLID)",
        "url": "https://web.archive.org/web/20150906155800/http://www.objectmentor.com/resources/articles/Principles_and_Patterns.pdf",
        "keywords": ["Martin", "Principles", "Patterns"],
        "doi": None
    },
    {
        "id": "liskov_1994",
        "author": "Barbara Liskov & Jeannette Wing (1994)",
        "work": "A Behavioral Notion of Subtyping (LSP)",
        "url": "https://doi.org/10.1145/197320.197383",
        "keywords": ["Liskov", "Subtyping"],
        "doi": "10.1145/197320.197383"
    },
    {
        "id": "larman_2001",
        "author": "Craig Larman (2001)",
        "work": "Applying UML and Patterns (Protected Variations)",
        "url": "https://www.craiglarman.com/wiki/index.php?title=Book_Applying_UML_and_Patterns",
        "keywords": ["Larman", "Applying UML and Patterns"],
        "doi": None
    },
    {
        "id": "cockburn_2005",
        "author": "Alistair Cockburn (2005)",
        "work": "Hexagonal Architecture",
        "url": "https://alistair.cockburn.us/hexagonal-architecture/",
        "keywords": ["Cockburn", "Hexagonal"],
        "doi": None
    },
    {
        "id": "fowler_2002",
        "author": "Martin Fowler (2002)",
        "work": "Patterns of Enterprise Application Architecture",
        "url": "https://martinfowler.com/books/eaa.html",
        "keywords": ["Fowler", "Enterprise Application Architecture"],
        "doi": None
    },
    {
        "id": "deutsch_fallacies",
        "author": "Peter Deutsch & James Gosling",
        "work": "The Eight Fallacies of Distributed Computing",
        "url": "https://en.wikipedia.org/wiki/Fallacies_of_distributed_computing",
        "keywords": ["Deutsch", "Fallacies of distributed computing"],
        "doi": None
    },
    {
        "id": "flp_1985",
        "author": "Fischer, Lynch, Paterson (1985)",
        "work": "Impossibility of Distributed Consensus with One Faulty Process (FLP)",
        "url": "https://doi.org/10.1145/3149.214121",
        "keywords": ["Fischer", "Lynch", "Paterson", "Consensus"],
        "doi": "10.1145/3149.214121"
    },
    {
        "id": "lamport_1978",
        "author": "Leslie Lamport (1978)",
        "work": "Time, Clocks, and the Ordering of Events in a Distributed System",
        "url": "https://doi.org/10.1145/359545.359563",
        "keywords": ["Lamport", "Time, Clocks", "Distributed System"],
        "doi": "10.1145/359545.359563"
    },
    {
        "id": "saltzer_1984",
        "author": "Saltzer, Reed, Clark (1984)",
        "work": "End-to-End Arguments in System Design",
        "url": "https://doi.org/10.1145/357401.357402",
        "keywords": ["Saltzer", "End-to-End Arguments"],
        "doi": "10.1145/357401.357402"
    },
    {
        "id": "abadi_2012",
        "author": "Daniel J. Abadi (2012)",
        "work": "Consistency Tradeoffs in Modern Distributed Database System Design (PACELC)",
        "url": "https://doi.org/10.1109/MC.2012.33",
        "keywords": ["Abadi", "Consistency Tradeoffs", "PACELC"],
        "doi": "10.1109/MC.2012.33"
    },
    {
        "id": "garcia_molina_1987",
        "author": "Garcia-Molina & Salem (1987)",
        "work": "Sagas",
        "url": "https://doi.org/10.1145/38713.38742",
        "keywords": ["Garcia-Molina", "Salem", "Sagas"],
        "doi": "10.1145/38713.38742"
    },
    {
        "id": "gray_1981",
        "author": "Jim Gray (1981)",
        "work": "The Transaction Concept: Virtues and Limitations",
        "url": "https://en.wikipedia.org/wiki/Relational_database",
        "keywords": ["Jim Gray", "The Transaction Concept: Virtues and Limitations"],
        "doi": None
    },
    {
        "id": "mohan_1992",
        "author": "C. Mohan et al. (1992)",
        "work": "ARIES: A Transaction Recovery Method Supporting Fine-Granularity Locking",
        "url": "https://doi.org/10.1145/128765.128770",
        "keywords": ["Mohan", "ARIES"],
        "doi": "10.1145/128765.128770"
    },
    {
        "id": "berenson_1995",
        "author": "Berenson, Bernstein, Gray et al. (1995)",
        "work": "A Critique of ANSI SQL Isolation Levels",
        "url": "https://doi.org/10.1145/223784.223785",
        "keywords": ["Berenson", "Critique of ANSI SQL Isolation Levels"],
        "doi": "10.1145/223784.223785"
    },
    {
        "id": "codd_1970",
        "author": "Edgar F. Codd (1970)",
        "work": "A Relational Model of Data for Large Shared Data Banks",
        "url": "https://doi.org/10.1145/362384.362685",
        "keywords": ["Codd", "Relational Model of Data"],
        "doi": "10.1145/362384.362685"
    }
]

def check_crossref_doi(doi):
    url = f"https://api.crossref.org/works/{doi}"
    headers = {"User-Agent": "AcademicAuditScript/1.0 (mailto:audit@example.com)"}
    req = urllib.request.Request(url, headers=headers)
    try:
        resp = urllib.request.urlopen(req, timeout=8)
        data = json.loads(resp.read().decode("utf-8"))
        msg = data.get("message", {})
        title = msg.get("title", [""])[0]
        authors = [a.get("family", "") for a in msg.get("author", [])]
        container = msg.get("container-title", [""])[0]
        return True, f"Crossref OK: \"{title}\" by {', '.join(authors)} in {container}"
    except Exception as e:
        return False, f"Crossref Error: {e}"

def check_html_url(url, keywords):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        resp = urllib.request.urlopen(req, context=ctx, timeout=10)
        content_type = resp.headers.get("Content-Type", "")
        body = resp.read()
        
        # If it is a PDF or binary
        if "application/pdf" in content_type:
            # Check length and non-empty
            if len(body) > 1000:
                return True, f"Direct PDF returned ({len(body)} bytes) HTTP 200"
            return False, f"PDF too small: {len(body)} bytes"
            
        text = body.decode("utf-8", errors="ignore")
        title_match = re.search(r"<title>(.*?)</title>", text, re.IGNORECASE | re.DOTALL)
        page_title = title_match.group(1).strip().replace("\n", " ") if title_match else "No <title>"
        
        # Check keywords
        text_lower = text.lower()
        matched = [kw for kw in keywords if kw.lower() in text_lower]
        
        if len(matched) > 0:
            return True, f"HTML Match: Title='{page_title[:60]}' | Found keywords: {matched}"
        else:
            return False, f"HTML Missing keywords: Title='{page_title[:60]}' | Expected: {keywords}"
    except urllib.error.HTTPError as e:
        return False, f"HTTP Error {e.code}"
    except Exception as e:
        return False, f"Network/SSL Error: {e}"

def main():
    print(f"=== Running Reference & Content Verification Audit ({len(REFERENCES)} items) ===\n")
    passed = 0
    failed = 0
    results = []

    for item in REFERENCES:
        ref_id = item["id"]
        label = item["author"]
        work = item["work"]
        url = item["url"]
        keywords = item["keywords"]
        doi = item.get("doi")
        
        print(f"[*] Auditing: {label} - {work}")
        print(f"    Target URL: {url}")
        
        # 1. HTML Verification
        html_ok, html_msg = check_html_url(url, keywords)
        
        # 2. DOI Verification (if applicable)
        doi_ok, doi_msg = (None, None)
        if doi:
            doi_ok, doi_msg = check_crossref_doi(doi)
            
        overall_ok = html_ok or (doi_ok is True)
        
        if overall_ok:
            passed += 1
            print(f"    -> [PASS]")
            if html_ok:
                print(f"       {html_msg}")
            if doi_ok:
                print(f"       {doi_msg}")
        else:
            failed += 1
            print(f"    -> [FAIL]")
            print(f"       HTML: {html_msg}")
            if doi:
                print(f"       DOI:  {doi_msg}")
        print()

    print("=" * 60)
    print(f"Audit Complete: {passed} PASSED, {failed} FAILED across {len(REFERENCES)} verified items.")
    print("=" * 60)

    if failed > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()

