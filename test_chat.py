"""
Quick test to see if RAG chatbot is working
"""
import sys

print("Testing RAG Chat System...")
print("=" * 60)

try:
    print("\n1. Importing RAG engine...")
    from rag_engine import get_rag_engine
    print("   [OK] Import successful")
    
    print("\n2. Getting RAG instance...")
    rag = get_rag_engine()
    
    if not rag:
        print("   [FAIL] RAG engine is None - initialization failed")
        sys.exit(1)
    
    print("   [OK] RAG instance obtained")
    
    print("\n3. Testing a simple query...")
    result = rag.ask("What is Microsoft?")
    
    print("\n4. Results:")
    print(f"   Success: {result.get('success', False)}")
    print(f"   Answer length: {len(result.get('answer', ''))} chars")
    print(f"   Sources: {len(result.get('sources', []))}")
    
    if result.get('error'):
        print(f"   Error: {result['error']}")
    
    print("\n" + "=" * 60)
    
    if result.get('success'):
        print("[SUCCESS] RAG is working!")
        print("\nSample answer (first 200 chars):")
        print(result['answer'][:200] + "...")
    else:
        print("[FAIL] Query failed")
        print(f"Answer: {result.get('answer')}")
        
except Exception as e:
    print(f"\n[FAIL] Error: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

