from typing import Dict, Any, List
import os
import json  # Add this import
from google.adk.agents import Agent
import requests


def get_consumer_advice(consumer_query: str) -> Dict[str, Any]:
    """
    ADK tool: Provide advice based on consumer query and protection act.
    Args:
        consumer_query: Consumer's question or issue
    Returns:
        Dictionary containing advice and relevant sections
    """
    DOC_PATH = os.path.join(os.path.dirname(__file__), '../consumer_protection_act.md')

    document_path = DOC_PATH
    if not os.path.exists(document_path):
        return {"advice": "Document not loaded. Please check the file path."}
    with open(document_path, 'r', encoding='utf-8') as file:
        document_content = file.read()
    def search_content(query: str) -> List[str]:
        lines = document_content.split('\n')
        relevant_sections = []
        query_lower = query.lower()
        for i, line in enumerate(lines):
            if query_lower in line.lower():
                start = max(0, i - 2)
                end = min(len(lines), i + 3)
                section = '\n'.join(lines[start:end])
                relevant_sections.append(section)
        return relevant_sections if relevant_sections else ["No relevant content found."]
    def extract_key_terms(query: str) -> List[str]:
        protection_keywords = [
            "refund", "warranty", "defective", "fraud", "misleading",
            "unfair", "dispute", "complaint", "rights", "compensation",
            "return", "exchange", "quality", "service", "contract"
        ]
        query_lower = query.lower()
        found_terms = [term for term in protection_keywords if term in query_lower]
        query_words = query_lower.split()
        important_words = [word for word in query_words if len(word) > 3]
        return list(set(found_terms + important_words))
    def generate_advice(query: str, relevant_content: List[str]) -> str:
        if not relevant_content or relevant_content == ["No relevant content found."]:
            return ("I couldn't find specific information in the Consumer Protection Act "
                   "for your query. Please consult with a legal professional or "
                   "contact your local consumer protection agency.")
        advice = "Based on the Consumer Protection Act, here's what you should know:\n\n"
        for i, content in enumerate(relevant_content[:3], 1):
            advice += f"{i}. {content}\n\n"
        advice += ("Please note: This is general information based on the act. "
                  "For specific legal advice, consult with a qualified attorney.")
        return advice
    key_terms = extract_key_terms(consumer_query)
    relevant_content = []
    for term in key_terms:
        content = search_content(term)
        relevant_content.extend(content)
    relevant_content = list(set(relevant_content))
    advice = generate_advice(consumer_query, relevant_content)
    return {
        "query": consumer_query,
        "key_terms": key_terms,
        "relevant_sections": relevant_content,
        "advice": advice
    }


def submit_grievance(grievance_details: str, 
                     state: str, 
                     purchaseCity: str, 
                     sectorIndustry: str, 
                     category: str,
                     company: str,
                     natureOfGrievance: str,
                     productValue: str,
                     dealerInfo: str = ""
                     ) -> dict:
    """
    ADK tool: Submits the grievance JSON to the API endpoint.
    Args:
        grievance_details: Text containing all the details about the grievance. make it lengthy and add legal terms with it.
        state: The indian state in which complaint is being registered, must be all caps 
        purchaseCity: The city in which complaint is being registered
        sectorIndustry: Sector / Industry for which complaint is being filed: must be one of "Agency Services", "Agriculture", "Airlines", "Automobiles", "Banking", "Broadband & Internet", "Consumer Durables", "Courier & Cargo", "Digital Payment Modes", "Direct Selling", "Drugs & Cosmetics", "DTH and Cable", "E- Commerce", "Electricity", "Electronics Products", "FMCG", "Food", "General Enquiry", "General Insurance", "Govt. Transport", "Health Services", "Higher Education", "Legal", "Legal Metrology", "Life Insurance", "Mutual Fund", "NBFCs", "Others", "Packers and Movers", "Petroleum", "Postal", "Private Education", "Public Distribution System", "Publications", "Railways", "Real Estate", "Retail Outlets", "School Education", "Shares and Securities", "Standards", "Telecom", "Travel & Tourism", "Water Supply"
        category: actual category for which greviance is being filed, text field
        company: The company towards which its being filed
        natureOfGrievance: The nature of the grievance being filed, brief description
        productValue: The Product Value - must be one of  : "below_1000" (Below ₹1,000), "1000_5000" (₹1,000 - ₹5,000), "5000_10000" (₹5,000 - ₹10,000), "10000_50000" (₹10,000 - ₹50,000), "above_50000" (Above ₹50,000)
        dealerInfo: info regarding the dealer
    Returns:
        dict: API response or error message.
    """
    gjson = {
        "grievanceType": "grievance",
        "grievanceClassification": "service_issue", 
        "state": state,
        "purchaseCity": purchaseCity,
        "sectorIndustry": sectorIndustry,
        "category": category,
        "company": company,
        "natureOfGrievance": natureOfGrievance,
        "productValue": productValue,
        "dealerInfo": dealerInfo,
        "grievanceDetails": grievance_details,
        "expectation": "refund",
        "registeredWithCompany": "yes",
        "declaration": True
    }
    # Write the above data in a data.json file
    with open("data.json", "w") as d:
        json.dump(gjson, d, indent=4)  # ✅ Fixed: Use json.dump() instead of gjson.dump()

    # Send to Flask backend API
    url = "http://localhost:5000/api/form-requests/"
    try:
        response = requests.post(url, json=gjson, headers={'Content-Type': 'application/json'})
        response.raise_for_status()
        result = response.json()
        
        return {
            "status": "success", 
            "message": "Grievance submitted successfully! Your grievance ID is: " + result.get("grievance_id", "N/A"),
            "grievance_id": result.get("grievance_id"),
            "response": result
        }
    except requests.exceptions.RequestException as e:
        return {"status": "error", "error": f"API Error: {str(e)}"}
    except Exception as e:
        return {"status": "error", "error": f"Unexpected error: {str(e)}"}

root_agent = Agent(
    name="consumer_protection_agent",
    model="gemini-2.0-flash",
    description="Agent to answer questions about consumer protection rights and laws, and file complaints.",
    instruction=(
        "You are a specialized AI agent trained on the Consumer Protection Act of India.\n"
        "Your role is to help users identify whether their grievance qualifies as a consumer complaint under the law.\n"
        "When a user describes their issue, you first classify it to determine if it falls under the scope of the Consumer Protection Act (e.g., unfair trade practices, defective goods, deficiency in services, insurance fraud, misleading advertisements).\n"
        "If the complaint is valid under consumer law, you immediately flag it as covered by the Act. Once a valid complaint is identified, you provide tailored settlement suggestions based on the nature of the grievance.\n"
        "Your settlement guidance includes: Possible remedies and rights under the Act, Benefits of settling the matter (e.g., refunds, replacements, compensation, free repairs, apology, or service correction), Steps to approach the seller/service provider for amicable resolution.\n"
        "You ensure that advice is clear, lawful, and in accordance with the Consumer Protection Act, and you avoid handling disputes outside its scope (e.g., family matters, employment issues).\n"
        "You do not file complaints directly unless instructed, but you prepare the user with accurate settlement options and explain the legal advantages they gain from resolving the matter amicably.\n\n"
        "If a user wants to file a complaint, you must collect all required information and submit the grievance using the complaint filing tool."
        "Also the first time a user tells about his issue to you , try showing a detailed description of their issue and how it relates to the consumer protection act. "
        "While filing complaint if some details are missing, tell exactly what is missing and needs to be provided. "
        "NOTE before submitting complaint filing make sure the following json format is obeyed. INFER AS MUCH AS POSSIBLE FROM PAST CONVERSATION. "
        "\n\n"
    ),
    tools=[get_consumer_advice, submit_grievance],
)