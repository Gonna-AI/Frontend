import { CaseResult, Analysis } from '../types/juris';

interface MockResponse {
    cases: CaseResult[];
    analysis: any; // Using any for flexibility to match the Analysis type structure
    content: string;
}

export const MOCK_RESPONSES: Record<string, MockResponse> = {
    // NORMAL MODE QUERIES
    "I accidentally hit a pedestrian at night while driving home, what are the legal consequences?": {
        content: "Based on the new Bharatiya Nyaya Sanhita (BNS) 2023, hit-and-run cases involving death are treated with high severity. If you flee the scene without reporting, you could face up to 10 years imprisonment under Section 106(2). However, reporting the incident immediately can mitigate this to 5 years under Section 106(1). The cases below illustrate how courts have historically treated similar negligence and flight scenarios.",
        cases: [
            {
                id: 'n-1',
                title: 'State v. Sanjeev Nanda',
                citation: 'AIR 2012 SC 3104',
                court: 'Supreme Court of India',
                date: '2012-08-03',
                judge: 'Justice Radhakrishnan',
                similarityScore: 0.95,
                facts: 'Accused drove a BMW at high speed, hitting multiple pedestrians and fleeing the scene. The primary issue was the act of fleeing and destruction of evidence.',
                holding: 'The Supreme Court upheld the conviction but modified the sentence to time served + community service + heavy fine, emphasizing that flight is a severe aggravating factor.',
                precedents: ['Alister Anthony Pareira v. State of Maharashtra'],
                metadata: {
                    court_type: 'Supreme Court',
                    jurisdiction: 'Criminal Law',
                    case_number: 'Crl. Appeal No. 803 of 2012',
                    parties: { petitioner: 'State', respondent: 'Sanjeev Nanda' },
                    statutes_cited: ['IPC Section 304A', 'IPC Section 201'],
                    year: 2012
                }
            },
            {
                id: 'n-2',
                title: 'Salman Khan v. State of Maharashtra',
                citation: '2015 BomCR (Cri) 601',
                court: 'Bombay High Court',
                date: '2015-12-10',
                judge: 'Justice A.R. Joshi',
                similarityScore: 0.88,
                facts: 'Alleged hit-and-run case involving a vehicle running over people sleeping on a pavement. Key issues involved evidence of driving and the chain of custody.',
                holding: 'The High Court acquitted the accused due to lack of conclusive evidence establishing he was the driver, highlighting the burden of proof in criminal negligence.',
                precedents: ['State of Haryana v. Bhajan Lal'],
                metadata: {
                    court_type: 'High Court',
                    jurisdiction: 'Criminal Law',
                    case_number: 'Criminal Appeal No. 572 of 2015',
                    parties: { petitioner: 'Salman Khan', respondent: 'State of Maharashtra' },
                    statutes_cited: ['IPC Section 304 Part II', 'Motor Vehicles Act'],
                    year: 2015
                }
            }
        ],
        analysis: {
            caseId: 'n-1',
            similaritySummary: 'Your query involves a hit-and-run scenario with potential fatalities. The Sanjeev Nanda case is 95% similar as it deals directly with the consequences of fleeing after a fatal accident.',
            keyLegalConcepts: ['Rash and Negligent Driving', 'Hit and Run', 'Duty to Report', 'Culpable Homicide'],
            precedentAnalysis: [
                'Courts treat fleeing as a major aggravating factor',
                'Reporting the accident can significantly reduce liability',
                'Burden of proof remains high for the prosecution regarding identity of driver'
            ],
            rhetoricalRoles: { facts: 30, arguments: 40, precedents: 10, reasoning: 20, ruling: 0 },
            citationNetwork: { directCitations: 5, indirectCitations: 12 }
        }
    },
    "My landlord is refusing to return my security deposit after I moved out, claiming damages I didn't cause.": {
        content: "Refusal to return security deposit for 'normal wear and tear' is a common dispute. Under the Model Tenancy Act and Consumer Protection laws, landlords cannot deduct for reasonable wear. You can approach the Rent Authority or Consumer Forum. The cases below show successful recovery of deposits with interest.",
        cases: [
            {
                id: 'n-3',
                title: 'Vikas Singh v. DLF Universal Ltd',
                citation: '2018 CPJ 45 (NC)',
                court: 'National Consumer Commission',
                date: '2018-05-12',
                judge: 'Justice D.K. Jain',
                similarityScore: 0.92,
                facts: 'Tenant vacated premises; landlord withheld deposit citing painting and cleaning charges. Tenant argued these were normal wear and tear.',
                holding: 'Commission ruled that painting and routine cleaning fall under normal wear and tear. Landlord ordered to refund deposit with 9% interest.',
                precedents: ['Lucknow Development Authority v. M.K. Gupta'],
                metadata: {
                    court_type: 'Consumer Commission',
                    jurisdiction: 'Consumer Law',
                    case_number: 'Consumer Complaint No. 102 of 2017',
                    parties: { petitioner: 'Vikas Singh', respondent: 'DLF Universal' },
                    statutes_cited: ['Consumer Protection Act', 'Transfer of Property Act'],
                    year: 2018
                }
            },
            {
                id: 'n-4',
                title: 'Col. T.S. Grewal v. Deepanjan Dutta',
                citation: '2021 DHC 2301',
                court: 'Delhi High Court',
                date: '2021-09-15',
                judge: 'Justice Prathiba M. Singh',
                similarityScore: 0.85,
                facts: 'Dispute over security deposit refund. Landlord claimed damages for broken fixtures which tenant proved were pre-existing.',
                holding: 'Court held that without joint inspection report at move-in, landlord cannot arbitrarily claim damages. Deposit must be refunded.',
                precedents: [],
                metadata: {
                    court_type: 'High Court',
                    jurisdiction: 'Civil Law',
                    case_number: 'CM (M) 450/2021',
                    parties: { petitioner: 'Col. T.S. Grewal', respondent: 'Deepanjan Dutta' },
                    statutes_cited: ['Rent Control Act'],
                    year: 2021
                }
            }
        ],
        analysis: {
            caseId: 'n-3',
            similaritySummary: 'The query matches disputes regarding security deposit deductions. Vikas Singh v. DLF is highly relevant (92%) as it establishes that normal wear and tear cannot be deducted.',
            keyLegalConcepts: ['Security Deposit', 'Normal Wear and Tear', 'Deficiency in Service', 'Unfair Trade Practice'],
            precedentAnalysis: [
                'Landlord bears burden to prove damages are beyond normal wear',
                'Interest is payable on wrongfully withheld deposits',
                'Joint inspection reports are crucial evidence'
            ],
            rhetoricalRoles: { facts: 25, arguments: 35, precedents: 15, reasoning: 25, ruling: 0 },
            citationNetwork: { directCitations: 3, indirectCitations: 8 }
        }
    },
    "I bought a defective laptop online and the seller refuses to refund or replace it.": {
        content: "E-commerce platforms and sellers are liable for defective goods under the Consumer Protection Act, 2019. 'No refund' policies for defective items are void. You are entitled to a replacement or refund. See these precedents where consumers were awarded compensation.",
        cases: [
            {
                id: 'n-5',
                title: 'C.N. Anantharam v. Fiat India Ltd',
                citation: 'AIR 2011 SC 523',
                court: 'Supreme Court of India',
                date: '2010-11-25',
                judge: 'Justice P. Sathasivam',
                similarityScore: 0.91,
                facts: 'Purchaser bought a vehicle with manufacturing defects. Dealer refused replacement. Issue was whether replacement is mandatory for defects.',
                holding: 'Supreme Court held that if a manufacturing defect is established, the consumer is entitled to replacement or full refund, plus compensation for harassment.',
                precedents: ['Maruti Udyog Ltd v. Susheel Kumar'],
                metadata: {
                    court_type: 'Supreme Court',
                    jurisdiction: 'Consumer Law',
                    case_number: 'Civil Appeal No. 892 of 2006',
                    parties: { petitioner: 'C.N. Anantharam', respondent: 'Fiat India' },
                    statutes_cited: ['Consumer Protection Act Section 14'],
                    year: 2010
                }
            },
            {
                id: 'n-6',
                title: 'Tata Croma v. Rahul Sethi',
                citation: '2019 SCDRC 45',
                court: 'State Consumer Commission',
                date: '2019-03-20',
                judge: 'Justice S.P. Wangdi',
                similarityScore: 0.89,
                facts: 'Defective laptop sold online. Seller claimed warranty only covers repair, not replacement. Laptop failed repeatedly.',
                holding: 'Commission ruled that selling a lemon product constitutes unfair trade practice. Ordered full refund with 12% interest and compensation.',
                precedents: [],
                metadata: {
                    court_type: 'State Commission',
                    jurisdiction: 'Consumer Law',
                    case_number: 'Appeal No. 234 of 2018',
                    parties: { petitioner: 'Tata Croma', respondent: 'Rahul Sethi' },
                    statutes_cited: ['Consumer Protection Act 2019'],
                    year: 2019
                }
            }
        ],
        analysis: {
            caseId: 'n-5',
            similaritySummary: 'Matches consumer disputes regarding defective goods and refusal to refund. Anantharam case is a landmark judgment (91%) affirming right to replacement.',
            keyLegalConcepts: ['Deficiency in Service', 'Manufacturing Defect', 'Right to Refund', 'Unfair Trade Practice'],
            precedentAnalysis: [
                'Manufacturing defects warrant full replacement',
                'Repeated repairs indicate inherent defect',
                'Compensation for mental agony is standard'
            ],
            rhetoricalRoles: { facts: 20, arguments: 30, precedents: 20, reasoning: 30, ruling: 0 },
            citationNetwork: { directCitations: 6, indirectCitations: 15 }
        }
    },

    // DEEP RESEARCH MODE QUERIES
    "I am representing a client accused in a dowry death case under Section 304B. I need a comprehensive analysis of recent Supreme Court judgments regarding the presumption of guilt and rebuttal standards, specifically focusing on the 'soon before death' interpretation.": {
        content: "Based on your detailed query regarding Section 304B IPC, I have analyzed the Supreme Court's evolving jurisprudence on the 'soon before death' standard. The presumption of guilt under Section 113B of the Evidence Act is rebuttable, but the prosecution must first establish the 'proximate live link' between cruelty and death. \n\nKey findings:\n1. 'Soon before death' is a relative term, not a fixed period.\n2. The burden shifts to the accused only after the prosecution proves harassment related to dowry.\n3. Rebuttal requires preponderance of probability, not proof beyond reasonable doubt.\n\nRefer to the following key precedents.",
        cases: [
            {
                id: 'd-1',
                title: 'Satbir Singh v. State of Haryana',
                citation: 'AIR 2021 SC 2627',
                court: 'Supreme Court of India',
                date: '2021-05-28',
                judge: 'Chief Justice N.V. Ramana',
                similarityScore: 0.98,
                facts: 'Appeal against conviction under 304B. The core issue was the interpretation of "soon before death" and whether the prosecution had established the link.',
                holding: 'SC clarified that "soon before death" must be interpreted flexibly to mean a "proximate live link". Section 304B is a strict liability provision once ingredients are met.',
                precedents: ['Kans Raj v. State of Punjab', 'Sher Singh v. State of Haryana'],
                metadata: {
                    court_type: 'Supreme Court',
                    jurisdiction: 'Criminal Law',
                    case_number: 'Criminal Appeal No. 1234 of 2021',
                    parties: { petitioner: 'Satbir Singh', respondent: 'State of Haryana' },
                    statutes_cited: ['IPC Section 304B', 'Evidence Act Section 113B'],
                    year: 2021
                }
            },
            {
                id: 'd-2',
                title: 'Kans Raj v. State of Punjab',
                citation: 'AIR 2000 SC 2324',
                court: 'Supreme Court of India',
                date: '2000-04-25',
                judge: 'Justice R.P. Sethi',
                similarityScore: 0.94,
                facts: 'Landmark case defining the temporal element of dowry death. Prosecution relied on circumstantial evidence of cruelty.',
                holding: 'Held that "soon before" is not synonymous with "immediately before". It depends on the facts and impact of cruelty on the victim\'s mind.',
                precedents: [],
                metadata: {
                    court_type: 'Supreme Court',
                    jurisdiction: 'Criminal Law',
                    case_number: 'Appeal (Crl.) 678 of 2000',
                    parties: { petitioner: 'Kans Raj', respondent: 'State of Punjab' },
                    statutes_cited: ['IPC Section 304B', 'Dowry Prohibition Act'],
                    year: 2000
                }
            }
        ],
        analysis: {
            caseId: 'd-1',
            similaritySummary: 'The query specifically targets the "soon before death" interpretation in 304B cases. Satbir Singh (2021) is the most recent and authoritative ruling (98% match) on this exact issue.',
            keyLegalConcepts: ['Dowry Death', 'Presumption of Guilt', 'Soon Before Death', 'Proximate Live Link', 'Section 113B Evidence Act'],
            precedentAnalysis: [
                'Satbir Singh expands the scope of "soon before" to "proximate live link"',
                'Kans Raj remains the foundational authority on temporal proximity',
                'Rebuttal burden on accused is lighter than prosecution burden'
            ],
            rhetoricalRoles: { facts: 15, arguments: 45, precedents: 25, reasoning: 15, ruling: 0 },
            citationNetwork: { directCitations: 12, indirectCitations: 34 }
        }
    },
    "Analyze the constitutional validity of the latest IT Rules amendment regarding intermediary liability, focusing on freedom of speech implications under Article 19(1)(a) and recent High Court precedents on safe harbor provisions.": {
        content: "The constitutional challenge to the IT Rules amendments centers on the dilution of 'Safe Harbor' protection under Section 79 of the IT Act. The tension lies between the state's power to regulate online content and the fundamental right to free speech. High Courts have issued stay orders on specific provisions like the 'Fact Check Unit'.\n\nKey Analysis:\n1. Safe Harbor is conditional on due diligence.\n2. Automated censorship may violate Article 19(1)(a).\n3. Recent stays indicate judicial skepticism towards executive overreach.",
        cases: [
            {
                id: 'd-3',
                title: 'Shreya Singhal v. Union of India',
                citation: 'AIR 2015 SC 1523',
                court: 'Supreme Court of India',
                date: '2015-03-24',
                judge: 'Justice R.F. Nariman',
                similarityScore: 0.96,
                facts: 'Challenge to Section 66A of IT Act. Relevant for its discussion on intermediary liability and the "chilling effect" on free speech.',
                holding: 'Section 66A struck down as unconstitutional. Intermediaries are only bound to act upon court orders or government directives, not private complaints.',
                precedents: ['Romesh Thappar v. State of Madras'],
                metadata: {
                    court_type: 'Supreme Court',
                    jurisdiction: 'Constitutional Law',
                    case_number: 'Writ Petition (Criminal) No. 167 of 2012',
                    parties: { petitioner: 'Shreya Singhal', respondent: 'Union of India' },
                    statutes_cited: ['Constitution Article 19(1)(a)', 'IT Act Section 66A', 'IT Act Section 79'],
                    year: 2015
                }
            },
            {
                id: 'd-4',
                title: 'Kunal Kamra v. Union of India',
                citation: '2023 Bom HC (Pending)',
                court: 'Bombay High Court',
                date: '2023-09-20',
                judge: 'Justice G.S. Patel',
                similarityScore: 0.93,
                facts: 'Challenge to the 2023 IT Rules Amendment establishing a government Fact Check Unit (FCU). Petitioner argued it violates Article 19(1)(a).',
                holding: 'Split verdict delivered. Matter referred to third judge. Interim stay on the operation of the FCU continues.',
                precedents: ['Shreya Singhal v. Union of India'],
                metadata: {
                    court_type: 'High Court',
                    jurisdiction: 'Constitutional Law',
                    case_number: 'Writ Petition (L) No. 9792 of 2023',
                    parties: { petitioner: 'Kunal Kamra', respondent: 'Union of India' },
                    statutes_cited: ['IT Rules 2021', 'Constitution Article 14', 'Constitution Article 19'],
                    year: 2023
                }
            }
        ],
        analysis: {
            caseId: 'd-3',
            similaritySummary: 'Shreya Singhal is the bedrock precedent (96%) for any discussion on online free speech and intermediary liability, directly addressing Article 19(1)(a) limits.',
            keyLegalConcepts: ['Intermediary Liability', 'Safe Harbor', 'Freedom of Speech', 'Chilling Effect', 'Reasonable Restrictions'],
            precedentAnalysis: [
                'Shreya Singhal limits intermediary liability to actual knowledge via court/govt order',
                'Current challenges rely heavily on the proportionality test from Puttaswamy',
                'Safe harbor is not absolute but procedural compliance is mandatory'
            ],
            rhetoricalRoles: { facts: 10, arguments: 50, precedents: 30, reasoning: 10, ruling: 0 },
            citationNetwork: { directCitations: 15, indirectCitations: 40 }
        }
    },
    "Prepare a detailed legal strategy for a corporate insolvency resolution process where the operational creditor's claim is disputed. Cite relevant NCLT and NCLAT rulings on 'pre-existing dispute' under the IBC code.": {
        content: "For a Corporate Insolvency Resolution Process (CIRP) under Section 9 of the IBC, the existence of a 'pre-existing dispute' is a complete defense. If the Corporate Debtor can show a plausible dispute raised before the demand notice, the application must be rejected. \n\nStrategy:\n1. Collate all correspondence showing dispute prior to Section 8 notice.\n2. Rely on Mobilox Innovations judgment.\n3. Demonstrate that the dispute is not spurious or hypothetical.",
        cases: [
            {
                id: 'd-5',
                title: 'Mobilox Innovations v. Kirusa Software',
                citation: 'AIR 2017 SC 4532',
                court: 'Supreme Court of India',
                date: '2017-09-21',
                judge: 'Justice R.F. Nariman',
                similarityScore: 0.99,
                facts: 'Operational Creditor filed for CIRP. Debtor claimed a pre-existing dispute regarding quality of service. NCLAT allowed CIRP; SC set it aside.',
                holding: 'SC held that if a "plausible contention" of a pre-existing dispute exists, the Adjudicating Authority must reject the Section 9 application. It need not decide the merits of the dispute.',
                precedents: [],
                metadata: {
                    court_type: 'Supreme Court',
                    jurisdiction: 'Insolvency Law',
                    case_number: 'Civil Appeal No. 9405 of 2017',
                    parties: { petitioner: 'Mobilox Innovations', respondent: 'Kirusa Software' },
                    statutes_cited: ['IBC Section 8', 'IBC Section 9'],
                    year: 2017
                }
            },
            {
                id: 'd-6',
                title: 'Swiss Ribbons Pvt Ltd v. Union of India',
                citation: 'AIR 2019 SC 739',
                court: 'Supreme Court of India',
                date: '2019-01-25',
                judge: 'Justice R.F. Nariman',
                similarityScore: 0.90,
                facts: 'Constitutional validity of IBC challenged. Addressed the distinction between Financial and Operational Creditors.',
                holding: 'Upheld the constitutionality of IBC. Clarified the rationale for treating Operational Creditors differently, emphasizing the "pre-existing dispute" safeguard.',
                precedents: ['Mobilox Innovations v. Kirusa Software'],
                metadata: {
                    court_type: 'Supreme Court',
                    jurisdiction: 'Insolvency Law',
                    case_number: 'Writ Petition (Civil) No. 99 of 2018',
                    parties: { petitioner: 'Swiss Ribbons', respondent: 'Union of India' },
                    statutes_cited: ['IBC Section 5', 'Constitution Article 14'],
                    year: 2019
                }
            }
        ],
        analysis: {
            caseId: 'd-5',
            similaritySummary: 'Mobilox Innovations is the definitive authority (99%) on "pre-existing disputes" under Section 9 IBC. It perfectly matches the strategy requirement for defending against an Operational Creditor.',
            keyLegalConcepts: ['Pre-existing Dispute', 'Operational Creditor', 'Section 8 Notice', 'Plausible Contention', 'CIRP'],
            precedentAnalysis: [
                'Mobilox sets the "plausible contention" test',
                'Dispute must be raised prior to the demand notice',
                'Adjudicating Authority has limited jurisdiction to verify dispute existence, not merits'
            ],
            rhetoricalRoles: { facts: 20, arguments: 40, precedents: 20, reasoning: 20, ruling: 0 },
            citationNetwork: { directCitations: 20, indirectCitations: 50 }
        }
    }
};
