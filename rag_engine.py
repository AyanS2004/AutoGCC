"""
RAG Engine for GCC Data Chatbot
Handles vector storage, retrieval, and LLM interaction
"""

from __future__ import annotations

import os
import pandas as pd
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from langchain_huggingface import HuggingFaceEmbeddings
    from langchain_community.vectorstores import Chroma
    from langchain.chains import RetrievalQA
    from langchain_community.llms import Ollama
    from langchain.prompts import PromptTemplate
    from langchain.schema import Document
    LANGCHAIN_AVAILABLE = True
except ImportError as e:
    LANGCHAIN_AVAILABLE = False
    print(f"Warning: LangChain not installed or incomplete. Error: {str(e)}")
    print("Install with: pip install langchain langchain-community langchain-huggingface ollama chromadb")


class GCCDataRAG:
    """RAG system for GCC data interaction"""
    
    def __init__(
        self,
        excel_file: str = 'book_final.xlsx',
        persist_directory: str = './chroma_db',
        local_model: str = 'tinyllama'
    ):
        if not LANGCHAIN_AVAILABLE:
            raise ImportError("LangChain is required for RAG functionality")
        
        self.excel_file = excel_file
        self.persist_directory = persist_directory
        self.local_model = local_model
        
        # Initialize embeddings - use local HuggingFace embeddings with CPU-only mode
        print("Using HuggingFace embeddings (local, CPU-only for stability)...")
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'},  # Force CPU usage
            encode_kwargs={'batch_size': 4}  # Very small encoding batch
        )
        
        # Initialize LLM - use local Ollama LLM
        print(f"Using local Ollama LLM (model: {self.local_model})...")
        print("Make sure Ollama is running: ollama serve")
        print(f"Make sure model is installed: ollama pull {self.local_model}")
        try:
            self.llm = Ollama(
                model=self.local_model,
                temperature=0.3,
                num_predict=1000
            )
        except Exception as e:
            raise ValueError(
                f"Failed to connect to Ollama. Make sure:\n"
                f"1. Ollama is installed: https://ollama.ai/\n"
                f"2. Ollama is running: ollama serve\n"
                f"3. Model is installed: ollama pull {self.local_model}\n"
                f"Error: {str(e)}"
            )
        
        # Initialize vector store
        self.vectorstore = None
        self.qa_chain = None
        
        # Load data
        self.load_and_index_data()
    
    def load_and_index_data(self):
        """Load Excel data and create vector index"""
        try:
            print(f"Loading GCC data from {self.excel_file}...")
            
            if not os.path.exists(self.excel_file):
                raise FileNotFoundError(f"Excel file not found: {self.excel_file}")
            
            # Read Excel file
            df = pd.read_excel(self.excel_file, engine='openpyxl')
            print(f"✓ Loaded {len(df)} rows from Excel")
            
            # Convert to documents
            print("Converting data to documents...")
            documents = self._convert_df_to_documents(df)
            
            if not documents:
                raise ValueError("No valid documents found in Excel file")
            
            print(f"✓ Created {len(documents)} documents")
            
            # Use batch processing for datasets > 100 documents to prevent memory issues
            import math
            import gc  # For garbage collection
            batch_size = 5  # ULTRA conservative - test if ChromaDB can even initialize
            
            if len(documents) > 50:  # Use batching for anything over 50 docs
                print(f"⏳ Large dataset detected - using batch processing to prevent crashes...")
                batches = math.ceil(len(documents) / batch_size)
                print(f"   Processing {len(documents)} documents in {batches} batches of {batch_size}...")
                
                for i in range(0, len(documents), batch_size):
                    batch = documents[i:i+batch_size]
                    batch_num = (i // batch_size) + 1
                    
                    try:
                        if i == 0:
                            # First batch - create new store
                            print(f"   [Batch {batch_num}/{batches}] Creating vector store...")
                            self.vectorstore = Chroma.from_documents(
                                documents=batch,
                                embedding=self.embeddings,
                                persist_directory=self.persist_directory
                            )
                        else:
                            # Subsequent batches - add to existing store
                            print(f"   [Batch {batch_num}/{batches}] Adding {len(batch)} documents...")
                            self.vectorstore.add_documents(batch)
                        
                        # Persist after EVERY batch to prevent data loss
                        self.vectorstore.persist()
                        gc.collect()  # Force garbage collection after every batch
                        
                        # Show progress every 10 batches
                        if batch_num % 10 == 0:
                            print(f"   ✓ Progress: {batch_num}/{batches} batches complete")
                        
                        # Small delay to prevent overwhelming the system
                        if batch_num < batches:
                            import time
                            time.sleep(0.5)
                            
                    except Exception as e:
                        print(f"   ✗ Batch {batch_num} failed: {str(e)}")
                        import traceback
                        traceback.print_exc()
                        raise
                
                # Final persist
                self.vectorstore.persist()
                print("✓ All batches indexed and persisted successfully")
                
            else:
                # Small dataset - index all at once
                print(f"⏳ Indexing {len(documents)} documents...")
                try:
                    self.vectorstore = Chroma.from_documents(
                        documents=documents,
                        embedding=self.embeddings,
                        persist_directory=self.persist_directory
                    )
                    self.vectorstore.persist()
                    print("✓ Indexing completed")
                except Exception as e:
                    print(f"✗ Indexing failed: {str(e)}")
                    raise
            
            # Create QA chain
            print("Creating QA chain...")
            self._create_qa_chain()
            
            print("✅ RAG system ready!")
            
        except Exception as e:
            print(f"❌ Error loading/indexing data: {str(e)}")
            print(f"   Check that {self.excel_file} exists and is not corrupted")
            raise
    
    def _convert_df_to_documents(self, df: pd.DataFrame) -> List[Document]:
        """Convert DataFrame rows to LangChain documents"""
        documents = []
        
        # Map column indices to field names
        field_map = {
            1: 'company_name',
            2: 'industries',
            3: 'revenue',
            4: 'gbs',
            5: 'global_gcc_units',
            6: 'global_gcc_locations',
            7: 'global_gcc_headcount',
            8: 'india_gcc_units',
            9: 'gcc_locations_india',
            12: 'city_bangalore',
            13: 'city_hyderabad',
            14: 'city_pune',
            15: 'city_chennai',
            16: 'city_mumbai',
            17: 'city_delhi_ncr',
            18: 'city_others',
            19: 'total_functions',
            20: 'gcc_functions',
            31: 'total_india_headcount'
        }
        
        for idx, row in df.iterrows():
            # Extract company data
            company_data = {}
            for col_idx, field_name in field_map.items():
                if col_idx < len(row):
                    value = row.iloc[col_idx]
                    # Clean URL markers
                    if pd.notna(value):
                        value_str = str(value).strip()
                        if '|URL:' in value_str:
                            value_str = value_str.split('|URL:')[0].strip()
                        if value_str and value_str not in ['NA', '', '0']:
                            company_data[field_name] = value_str
            
            if 'company_name' not in company_data:
                continue
            
            # Create rich text content
            content = self._create_document_content(company_data)
            
            # Create document
            doc = Document(
                page_content=content,
                metadata={
                    'company_name': company_data['company_name'],
                    'row_index': int(idx),
                    **{k: v for k, v in company_data.items() if k != 'company_name'}
                }
            )
            documents.append(doc)
        
        return documents
    
    def _create_document_content(self, data: Dict[str, str]) -> str:
        """Create rich text content for a company"""
        company = data.get('company_name', 'Unknown')
        
        content_parts = [f"Company Profile: {company}"]
        
        # Basic info
        if 'industries' in data:
            content_parts.append(f"Industry Sectors: {data['industries']}")
        if 'revenue' in data:
            content_parts.append(f"Annual Revenue: ${data['revenue']} million USD")
        if 'gbs' in data:
            content_parts.append(f"Global Business Services (GBS): {data['gbs']}")
        
        # Global GCC info
        if 'global_gcc_units' in data:
            content_parts.append(f"Number of Global GCC Units: {data['global_gcc_units']}")
        if 'global_gcc_locations' in data:
            content_parts.append(f"Global GCC Countries/Regions: {data['global_gcc_locations']}")
        if 'global_gcc_headcount' in data:
            content_parts.append(f"Total Global GCC Employees: {data['global_gcc_headcount']}")
        
        # India info
        if 'india_gcc_units' in data:
            content_parts.append(f"Number of GCC Units in India: {data['india_gcc_units']}")
        if 'gcc_locations_india' in data:
            content_parts.append(f"Indian GCC Cities: {data['gcc_locations_india']}")
        if 'total_india_headcount' in data:
            content_parts.append(f"Total India GCC Headcount: {data['total_india_headcount']}")
        
        # City presence
        cities = []
        city_fields = {
            'bangalore': 'Bangalore',
            'hyderabad': 'Hyderabad',
            'pune': 'Pune',
            'chennai': 'Chennai',
            'mumbai': 'Mumbai',
            'delhi_ncr': 'Delhi NCR'
        }
        for city_key, city_name in city_fields.items():
            if data.get(f'city_{city_key}') == 'Yes':
                cities.append(city_name)
        if cities:
            content_parts.append(f"GCC Presence in Cities: {', '.join(cities)}")
        
        # Functions
        if 'gcc_functions' in data:
            content_parts.append(f"GCC Functional Areas: {data['gcc_functions']}")
        if 'total_functions' in data:
            content_parts.append(f"Number of Functions: {data['total_functions']}")
        
        return "\n".join(content_parts)
    
    def _create_qa_chain(self):
        """Create the QA chain with custom prompt"""
        
        prompt_template = """You are an expert analyst specializing in Global Capability Centers (GCC) and Global Business Services (GBS). 

Use the following company information to answer the question. Be specific, use numbers when available, and cite company names.

If you don't have enough information, say so honestly. Don't make up facts.

Context Information:
{context}

Question: {question}

Detailed Answer:"""

        PROMPT = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )
        
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.vectorstore.as_retriever(
                search_type="similarity",
                search_kwargs={"k": 5}  # Return top 5 relevant documents
            ),
            return_source_documents=True,
            chain_type_kwargs={"prompt": PROMPT}
        )
    
    def ask(self, question: str) -> Dict[str, Any]:
        """Ask a question and get an answer with sources"""
        if not self.qa_chain:
            return {
                'answer': 'RAG system not initialized properly',
                'sources': [],
                'error': 'System not ready'
            }
        
        try:
            result = self.qa_chain({"query": question})
            
            # Extract source companies
            sources = []
            seen_companies = set()
            
            if 'source_documents' in result:
                for doc in result['source_documents']:
                    if 'company_name' in doc.metadata:
                        company = doc.metadata['company_name']
                        if company not in seen_companies:
                            seen_companies.add(company)
                            sources.append({
                                'company': company,
                                'content': doc.page_content[:300] + '...' if len(doc.page_content) > 300 else doc.page_content
                            })
            
            return {
                'answer': result['result'],
                'sources': sources[:5],  # Limit to top 5 sources
                'question': question,
                'success': True
            }
        
        except Exception as e:
            print(f"Error in RAG query: {str(e)}")
            return {
                'answer': f'I encountered an error processing your question. Please try rephrasing or ask something else.',
                'sources': [],
                'error': str(e),
                'success': False
            }
    
    def get_company_summary(self, company_name: str) -> Dict[str, Any]:
        """Get detailed summary for a specific company"""
        question = f"Give me a comprehensive overview of {company_name}'s Global Capability Center operations, including locations, headcount, and functions."
        return self.ask(question)
    
    def compare_companies(self, companies: List[str]) -> Dict[str, Any]:
        """Compare multiple companies"""
        companies_str = ', '.join(companies)
        question = f"Compare and contrast the GCC operations of these companies: {companies_str}. Include information about their locations, scale, and functional capabilities."
        return self.ask(question)
    
    def refresh_index(self):
        """Refresh the vector index with latest data"""
        print("Refreshing RAG index with latest data...")
        try:
            self.load_and_index_data()
            return {'success': True, 'message': 'Index refreshed successfully'}
        except Exception as e:
            return {'success': False, 'error': str(e)}


# Singleton instance
_rag_instance: Optional[GCCDataRAG] = None

def get_rag_engine() -> Optional[GCCDataRAG]:
    """Get or create RAG engine instance"""
    global _rag_instance
    if _rag_instance is None:
        try:
            _rag_instance = GCCDataRAG()
        except Exception as e:
            print(f"Failed to initialize RAG engine: {str(e)}")
            return None
    return _rag_instance

def is_rag_available() -> bool:
    """Check if RAG dependencies are available"""
    if not LANGCHAIN_AVAILABLE:
        return False
    
    # RAG is available if LangChain is installed
    # Actual connection to Ollama will be tested during initialization
    return True


