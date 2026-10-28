const fs = require('fs');
const path = require('path');

const rawList = [
  // 1. OpenAI (24 Models)
  { category: 'OpenAI', family: 'openai', name: 'GPT-6 Astra (Max)', desc: 'Next-generation frontier reasoning and multimodal system by OpenAI.', think: true, vision: true, ctx: 2000000 },
  { category: 'OpenAI', family: 'openai', name: 'GPT-6 Astra (XHigh)', desc: 'High-throughput Astra reasoning flagship model with extended context.', think: true, vision: true, ctx: 1000000 },
  { category: 'OpenAI', family: 'openai', name: 'GPT-6.1 Sol', desc: 'Breakthrough autonomous reasoning and problem solving system.', think: true, vision: true, ctx: 1000000 },
  { category: 'OpenAI', family: 'openai', name: 'GPT-6 Sol (Daybreak Blue)', desc: 'Specialized high-efficiency variant tuned for low-latency coding and dialogue.', think: true, vision: true, ctx: 500000 },
  { category: 'OpenAI', family: 'openai', name: 'GPT-6 Luna Decisions', desc: 'Executive strategic decision analysis and multi-turn scenario simulation.', think: true, vision: false, ctx: 500000 },
  { category: 'OpenAI', family: 'openai', name: 'GPT-5.6 Soul', desc: 'Empathic conversational intelligence with human-aligned nuance.', think: false, vision: true, ctx: 256000 },
  { category: 'OpenAI', family: 'openai', name: 'GPT-5.6 Sol', desc: 'Accelerated high-intelligence engine for everyday professional reasoning.', think: true, vision: true, ctx: 256000 },
  { category: 'OpenAI', family: 'openai', name: 'GPT-5.6 Terra', desc: 'Scientific, mathematical, and spatial knowledge foundational engine.', think: true, vision: true, ctx: 256000 },
  { category: 'OpenAI', family: 'openai', name: 'GPT-5.5 Pro', desc: 'Professional enterprise system for complex multi-step workflows.', think: true, vision: true, ctx: 512000 },
  { category: 'OpenAI', family: 'openai', name: 'GPT-5.5', desc: 'High capability foundational model for versatile general tasks.', think: true, vision: true, ctx: 256000 },
  { category: 'OpenAI', family: 'openai', name: 'GPT-5.4 Pro', desc: 'Enterprise flagship system with enhanced architectural reasoning.', think: true, vision: true, ctx: 256000 },
  { category: 'OpenAI', family: 'openai', name: 'GPT-5.4', desc: 'Versatile intelligence for advanced programming and analysis.', think: false, vision: true, ctx: 128000 },
  { category: 'OpenAI', family: 'openai', name: 'GPT-5.1', desc: 'Fast, balanced intelligence for production workloads.', think: false, vision: true, ctx: 128000 },
  { category: 'OpenAI', family: 'openai', name: 'GPT-4o', desc: 'Omni-channel flagship for real-time text, voice, and vision integration.', think: false, vision: true, ctx: 128000 },
  { category: 'OpenAI', family: 'openai', name: 'GPT-4o-mini', desc: 'Cost-efficient, fast multimodal model for lightweight intelligence.', think: false, vision: true, ctx: 128000 },
  { category: 'OpenAI', family: 'openai', name: 'GPT-4.1', desc: 'Refined instruction-following and code generation model.', think: false, vision: true, ctx: 128000 },
  { category: 'OpenAI', family: 'openai', name: 'GPT-4.1-mini', desc: 'Lightweight, rapid response variant of the GPT-4.1 family.', think: false, vision: true, ctx: 128000 },
  { category: 'OpenAI', family: 'openai', name: 'GPT-4 Turbo', desc: 'High-capability system with 128k context and up-to-date knowledge.', think: false, vision: true, ctx: 128000 },
  { category: 'OpenAI', family: 'openai', name: 'GPT-4', desc: 'Classic landmark foundational model for complex reasoning.', think: false, vision: false, ctx: 32768 },
  { category: 'OpenAI', family: 'openai', name: 'GPT-3.5 Turbo', desc: 'Fast, cost-efficient model for general dialogue and completion.', think: false, vision: false, ctx: 16384 },
  { category: 'OpenAI', family: 'openai', name: 'o1', desc: 'Deep reinforcement-learning reasoning model for STEM and coding.', think: true, vision: true, ctx: 200000 },
  { category: 'OpenAI', family: 'openai', name: 'o1-mini', desc: 'Faster, cost-efficient reasoning model optimized for math and code.', think: true, vision: false, ctx: 128000 },
  { category: 'OpenAI', family: 'openai', name: 'o1-preview', desc: 'Preview release of OpenAI reasoning model with internal thought process.', think: true, vision: false, ctx: 128000 },
  { category: 'OpenAI', family: 'openai', name: 'Text-Embedding-3-Large', desc: 'High-dimensional semantic embedding vector generator.', think: false, vision: false, ctx: 8192 },

  // 2. Anthropic (22 Models)
  { category: 'Anthropic', family: 'anthropic', name: 'Claude Opus 5.5', desc: 'Anthropic premier frontier cognitive model with unprecedented depth.', think: true, vision: true, ctx: 500000 },
  { category: 'Anthropic', family: 'anthropic', name: 'Claude Sonnet 5.5', desc: 'State-of-the-art balance of speed and elite intelligence.', think: true, vision: true, ctx: 500000 },
  { category: 'Anthropic', family: 'anthropic', name: 'Claude Haiku 5.5', desc: 'Ultra-fast, near-instantaneous multimodal intelligence.', think: false, vision: true, ctx: 200000 },
  { category: 'Anthropic', family: 'anthropic', name: 'Claude Fable 5.1', desc: 'Narrative synthesis and complex literary composition specialist.', think: true, vision: true, ctx: 300000 },
  { category: 'Anthropic', family: 'anthropic', name: 'Claude Fable 5', desc: 'Creative composition and multi-perspective storytelling model.', think: false, vision: true, ctx: 200000 },
  { category: 'Anthropic', family: 'anthropic', name: 'Claude Opus 5', desc: 'Fifth-generation Opus model for long-horizon scientific analysis.', think: true, vision: true, ctx: 400000 },
  { category: 'Anthropic', family: 'anthropic', name: 'Claude Opus 4.8', desc: 'Deep analytical intelligence with high constitutional safety.', think: true, vision: true, ctx: 300000 },
  { category: 'Anthropic', family: 'anthropic', name: 'Claude Opus 4.7', desc: 'High-precision logical reasoning and architecture design.', think: true, vision: true, ctx: 200000 },
  { category: 'Anthropic', family: 'anthropic', name: 'Claude Sonnet 4.6', desc: 'Enterprise-grade coding, refactoring, and agentic workflows.', think: true, vision: true, ctx: 200000 },
  { category: 'Anthropic', family: 'anthropic', name: 'Claude 3.5 Opus', desc: 'Top-tier frontier intelligence for complex problem-solving.', think: true, vision: true, ctx: 200000 },
  { category: 'Anthropic', family: 'anthropic', name: 'Claude 3.5 Sonnet', desc: 'Industry-leading code generation and contextual reasoning.', think: true, vision: true, ctx: 200000 },
  { category: 'Anthropic', family: 'anthropic', name: 'Claude 3.5 Haiku', desc: 'Fast, highly capable model for real-time interactions.', think: false, vision: true, ctx: 200000 },
  { category: 'Anthropic', family: 'anthropic', name: 'Claude 3 Opus', desc: 'Foundational Opus release with exceptional comprehension.', think: true, vision: true, ctx: 200000 },
  { category: 'Anthropic', family: 'anthropic', name: 'Claude 3 Sonnet', desc: 'Balanced enterprise model with vision understanding.', think: false, vision: true, ctx: 200000 },
  { category: 'Anthropic', family: 'anthropic', name: 'Claude 3 Haiku', desc: 'Speed-optimized lightweight vision-language model.', think: false, vision: true, ctx: 200000 },
  { category: 'Anthropic', family: 'anthropic', name: 'Claude 2.1', desc: '200k context window with reduced hallucination rates.', think: false, vision: false, ctx: 200000 },
  { category: 'Anthropic', family: 'anthropic', name: 'Claude 2.0', desc: 'Original second-generation Claude conversational model.', think: false, vision: false, ctx: 100000 },
  { category: 'Anthropic', family: 'anthropic', name: 'Claude Instant 1.2', desc: 'Fast, casual conversational assistant by Anthropic.', think: false, vision: false, ctx: 100000 },
  { category: 'Anthropic', family: 'anthropic', name: 'Claude Instant 1.1', desc: 'Legacy low-latency version of Claude Instant.', think: false, vision: false, ctx: 100000 },
  { category: 'Anthropic', family: 'anthropic', name: 'Claude 1.3', desc: 'Landmark original Claude model release.', think: false, vision: false, ctx: 9000 },
  { category: 'Anthropic', family: 'anthropic', name: 'Claude 1.2', desc: 'Early foundation model from Anthropic.', think: false, vision: false, ctx: 9000 },
  { category: 'Anthropic', family: 'anthropic', name: 'Claude 1.0', desc: 'Initial release of Claude constitutional AI.', think: false, vision: false, ctx: 9000 },

  // 3. Google DeepMind (25 Models)
  { category: 'Google DeepMind', family: 'google', name: 'Gemini 4 Argon', desc: 'Google DeepMind next-generation multimodal cognitive engine.', think: true, vision: true, ctx: 2000000 },
  { category: 'Google DeepMind', family: 'google', name: 'Gemini 3.8 Flash', desc: 'Ultra-fast real-time multimodal reasoning with 1M context.', think: true, vision: true, ctx: 1000000 },
  { category: 'Google DeepMind', family: 'google', name: 'Gemini 3.8 Live', desc: 'Interactive real-time audio and visual dialogue agent.', think: false, vision: true, ctx: 1000000 },
  { category: 'Google DeepMind', family: 'google', name: 'Gemini 3.5 Flash-Lite', desc: 'Ultra-lightweight low-latency edge inference engine.', think: false, vision: true, ctx: 500000 },
  { category: 'Google DeepMind', family: 'google', name: 'Gemini 3.1 Pro', desc: 'Frontier reasoning model for math, coding, and scientific research.', think: true, vision: true, ctx: 2000000 },
  { category: 'Google DeepMind', family: 'google', name: 'Gemini Omni 1.1 Flash', desc: 'Omni-modal comprehension spanning text, audio, and video.', think: false, vision: true, ctx: 1000000 },
  { category: 'Google DeepMind', family: 'google', name: 'Gemini Omni', desc: 'Native multi-stream reasoning across sensory modalities.', think: true, vision: true, ctx: 1000000 },
  { category: 'Google DeepMind', family: 'google', name: 'Gemini Audio', desc: 'Specialized conversational voice understanding and generation.', think: false, vision: false, ctx: 128000 },
  { category: 'Google DeepMind', family: 'google', name: 'Gemini Robotics 2', desc: 'Spatial intelligence and robotic action sequence planning.', think: true, vision: true, ctx: 256000 },
  { category: 'Google DeepMind', family: 'google', name: 'Gemini Embedding', desc: 'State-of-the-art semantic vector representation model.', think: false, vision: false, ctx: 8192 },
  { category: 'Google DeepMind', family: 'google', name: 'Gemini 1.5 Pro', desc: '2M context flagship with breakthrough needle-in-haystack recall.', think: true, vision: true, ctx: 2000000 },
  { category: 'Google DeepMind', family: 'google', name: 'Gemini 1.5 Flash', desc: 'Fast, lightweight multimodal model built for speed and efficiency.', think: false, vision: true, ctx: 1000000 },
  { category: 'Google DeepMind', family: 'google', name: 'Gemini 1.0 Pro', desc: 'Foundational Gemini model for general text and reasoning tasks.', think: false, vision: false, ctx: 32768 },
  { category: 'Google DeepMind', family: 'google', name: 'Gemini 1.0 Ultra', desc: 'Large multimodal model exceeding human experts on MMLU.', think: true, vision: true, ctx: 32768 },
  { category: 'Google DeepMind', family: 'google', name: 'Gemma 4', desc: 'Fourth-generation open-weights architecture from Google.', think: true, vision: true, ctx: 128000 },
  { category: 'Google DeepMind', family: 'google', name: 'Gemma 3', desc: 'Advanced open weights model with enhanced multilingual reasoning.', think: false, vision: true, ctx: 128000 },
  { category: 'Google DeepMind', family: 'google', name: 'Gemma 3n', desc: 'Specialized neural processing unit optimized Gemma build.', think: false, vision: false, ctx: 65536 },
  { category: 'Google DeepMind', family: 'google', name: 'Gemma 2 27B', desc: 'High-performance 27B parameter open-weights model.', think: false, vision: false, ctx: 8192 },
  { category: 'Google DeepMind', family: 'google', name: 'Gemma 2 9B', desc: 'Compact, efficient open weights model for local deployment.', think: false, vision: false, ctx: 8192 },
  { category: 'Google DeepMind', family: 'google', name: 'Gemma 2 2B', desc: 'Ultra-compact model designed for on-device applications.', think: false, vision: false, ctx: 8192 },
  { category: 'Google DeepMind', family: 'google', name: 'EmbeddingGemma 2', desc: 'Open-weights text embedding model by Google DeepMind.', think: false, vision: false, ctx: 8192 },
  { category: 'Google DeepMind', family: 'google', name: 'CodeGemma', desc: 'Specialized open model trained on billions of lines of code.', think: false, vision: false, ctx: 16384 },
  { category: 'Google DeepMind', family: 'google', name: 'PaliGemma', desc: 'Open vision-language foundation model for image captioning and Q&A.', think: false, vision: true, ctx: 8192 },
  { category: 'Google DeepMind', family: 'google', name: 'Genie 3', desc: 'Generative interactive world model for virtual environment creation.', think: true, vision: true, ctx: 128000 },
  { category: 'Google DeepMind', family: 'google', name: 'Lyria', desc: 'DeepMind music and audio generation neural architecture.', think: false, vision: false, ctx: 32768 },

  // 4. Meta AI (20 Models)
  { category: 'Meta AI', family: 'meta', name: 'Llama 4 Maverick', desc: 'Meta next-generation frontier open-weight reasoning model.', think: true, vision: true, ctx: 1000000 },
  { category: 'Meta AI', family: 'meta', name: 'Llama 4 Scout', desc: 'High-speed scouting and search-synthesis autonomous agent model.', think: false, vision: true, ctx: 512000 },
  { category: 'Meta AI', family: 'meta', name: 'Llama 4 Multimodal', desc: 'Natively trained audio, vision, and text open-weights model.', think: true, vision: true, ctx: 512000 },
  { category: 'Meta AI', family: 'meta', name: 'Llama 3.3 70B', desc: 'Industry standard open-weights model delivering near 405B capabilities.', think: true, vision: true, ctx: 128000 },
  { category: 'Meta AI', family: 'meta', name: 'Llama 3.1 405B', desc: 'Flagship open-weights foundation model rivaling leading proprietary APIs.', think: true, vision: true, ctx: 128000 },
  { category: 'Meta AI', family: 'meta', name: 'Llama 3.1 70B', desc: 'Highly capable open weights model for complex reasoning and tools.', think: false, vision: false, ctx: 128000 },
  { category: 'Meta AI', family: 'meta', name: 'Llama 3.1 8B', desc: 'Fast, lightweight open model with 128k context support.', think: false, vision: false, ctx: 128000 },
  { category: 'Meta AI', family: 'meta', name: 'Llama 3 70B', desc: 'High-capability third-generation open-weights language model.', think: false, vision: false, ctx: 8192 },
  { category: 'Meta AI', family: 'meta', name: 'Llama 3 8B', desc: 'Efficient, rapid foundational model from Meta AI.', think: false, vision: false, ctx: 8192 },
  { category: 'Meta AI', family: 'meta', name: 'Llama 2 70B', desc: 'Classic landmark open-source model trained by Meta.', think: false, vision: false, ctx: 4096 },
  { category: 'Meta AI', family: 'meta', name: 'Llama 2 13B', desc: 'Medium size open model suitable for mid-tier inference.', think: false, vision: false, ctx: 4096 },
  { category: 'Meta AI', family: 'meta', name: 'Llama 2 7B', desc: 'Compact open foundation model by Meta.', think: false, vision: false, ctx: 4096 },
  { category: 'Meta AI', family: 'meta', name: 'Llama Guard 3', desc: 'Safety classification model trained for human-AI interaction evaluation.', think: false, vision: true, ctx: 128000 },
  { category: 'Meta AI', family: 'meta', name: 'Llama Guard 2', desc: 'Content moderation and safety benchmark classifier.', think: false, vision: false, ctx: 8192 },
  { category: 'Meta AI', family: 'meta', name: 'Code Llama 34B', desc: 'Specialized code completion and generation model by Meta.', think: false, vision: false, ctx: 16384 },
  { category: 'Meta AI', family: 'meta', name: 'Code Llama 13B', desc: 'Mid-range coding assistant model with infilling capabilities.', think: false, vision: false, ctx: 16384 },
  { category: 'Meta AI', family: 'meta', name: 'Code Llama 7B', desc: 'Fast code generation and debugging model.', think: false, vision: false, ctx: 16384 },
  { category: 'Meta AI', family: 'meta', name: 'Muse Wonder Full', desc: 'Creative multimodal art and text composition architecture.', think: false, vision: true, ctx: 65536 },
  { category: 'Meta AI', family: 'meta', name: 'Muse Wonder 1.0', desc: 'Visual storytelling and image synthesis engine by Meta AI.', think: false, vision: true, ctx: 65536 },
  { category: 'Meta AI', family: 'meta', name: 'Muse Spark Open', desc: 'Open-weights generative imagination model.', think: false, vision: true, ctx: 65536 },

  // 5. Microsoft & Azure AI (15 Models)
  { category: 'Microsoft & Azure AI', family: 'microsoft', name: 'Microsoft-Decision-1', desc: 'Enterprise decision engine for automated operations and business logic.', think: true, vision: false, ctx: 256000 },
  { category: 'Microsoft & Azure AI', family: 'microsoft', name: 'Phi-4 Reasoning', desc: 'State-of-the-art synthetic-data trained reasoning small language model.', think: true, vision: false, ctx: 128000 },
  { category: 'Microsoft & Azure AI', family: 'microsoft', name: 'Phi-3.5 MoE', desc: 'Mixture-of-Experts small language model delivering high token efficiency.', think: false, vision: false, ctx: 128000 },
  { category: 'Microsoft & Azure AI', family: 'microsoft', name: 'Phi-3.5 Vision', desc: 'Multimodal vision-language model with OCR and visual reasoning.', think: false, vision: true, ctx: 128000 },
  { category: 'Microsoft & Azure AI', family: 'microsoft', name: 'Phi-3.5 Mini', desc: 'Lightweight 3.8B model outperforming models twice its size.', think: false, vision: false, ctx: 128000 },
  { category: 'Microsoft & Azure AI', family: 'microsoft', name: 'Phi-3 Medium', desc: '14B parameter model with impressive math and logic abilities.', think: false, vision: false, ctx: 128000 },
  { category: 'Microsoft & Azure AI', family: 'microsoft', name: 'Phi-3 Small', desc: '7B parameter small language model with high benchmark scores.', think: false, vision: false, ctx: 128000 },
  { category: 'Microsoft & Azure AI', family: 'microsoft', name: 'Phi-3 Mini', desc: 'Compact 3.8B parameter model trained on textbook quality data.', think: false, vision: false, ctx: 128000 },
  { category: 'Microsoft & Azure AI', family: 'microsoft', name: 'Phi-2', desc: '2.7B parameter model demonstrating high reasoning capabilities.', think: false, vision: false, ctx: 2048 },
  { category: 'Microsoft & Azure AI', family: 'microsoft', name: 'Phi-1.5', desc: 'Transformer model for Python code and common sense reasoning.', think: false, vision: false, ctx: 2048 },
  { category: 'Microsoft & Azure AI', family: 'microsoft', name: 'Phi-1', desc: 'Pioneering small model trained exclusively on textbook data.', think: false, vision: false, ctx: 2048 },
  { category: 'Microsoft & Azure AI', family: 'microsoft', name: 'Orca 2', desc: 'Teaching small language models how to reason through step-by-step traces.', think: true, vision: false, ctx: 4096 },
  { category: 'Microsoft & Azure AI', family: 'microsoft', name: 'WizardLM-2 8x22B', desc: 'High-capability Mixture-of-Experts model trained with Evol-Instruct.', think: false, vision: false, ctx: 65536 },
  { category: 'Microsoft & Azure AI', family: 'microsoft', name: 'WizardMath', desc: 'Reinforcement learning mathematical problem solver.', think: true, vision: false, ctx: 4096 },
  { category: 'Microsoft & Azure AI', family: 'microsoft', name: 'WizardCoder', desc: 'Code generation model powered by complex instruction evolution.', think: false, vision: false, ctx: 8192 },

  // 6. Alibaba Qwen (16 Models)
  { category: 'Alibaba Qwen', family: 'alibaba', name: 'Qwen3.8 Max', desc: 'Flagship trillion-token cognitive system with comprehensive domain mastery.', think: true, vision: true, ctx: 1000000 },
  { category: 'Alibaba Qwen', family: 'alibaba', name: 'Qwen3.7', desc: 'Next-generation multilingual and agentic reasoning model.', think: true, vision: true, ctx: 512000 },
  { category: 'Alibaba Qwen', family: 'alibaba', name: 'Qwen3.6 27B', desc: 'High-efficiency 27B model delivering near-frontier benchmarks.', think: true, vision: true, ctx: 256000 },
  { category: 'Alibaba Qwen', family: 'alibaba', name: 'Qwen3.5', desc: 'Versatile foundation model with exceptional coding and STEM performance.', think: false, vision: true, ctx: 128000 },
  { category: 'Alibaba Qwen', family: 'alibaba', name: 'Qwen3 Embedding 8B', desc: 'High-recall multilingual semantic vector search model.', think: false, vision: false, ctx: 8192 },
  { category: 'Alibaba Qwen', family: 'alibaba', name: 'Qwen3 Reranker 8B', desc: 'State-of-the-art neural passage reranking engine.', think: false, vision: false, ctx: 8192 },
  { category: 'Alibaba Qwen', family: 'alibaba', name: 'Qwen2.5-72B-Instruct', desc: 'Flagship open weights model surpassing most proprietary models.', think: true, vision: false, ctx: 128000 },
  { category: 'Alibaba Qwen', family: 'alibaba', name: 'Qwen2.5-32B-Instruct', desc: 'Balanced 32B model offering optimum speed-to-intelligence ratio.', think: false, vision: false, ctx: 128000 },
  { category: 'Alibaba Qwen', family: 'alibaba', name: 'Qwen2.5-14B-Instruct', desc: 'Fast, capable 14B model for coding, math, and long text.', think: false, vision: false, ctx: 128000 },
  { category: 'Alibaba Qwen', family: 'alibaba', name: 'Qwen2.5-7B-Instruct', desc: 'Popular open-weights model for local and edge inference.', think: false, vision: false, ctx: 128000 },
  { category: 'Alibaba Qwen', family: 'alibaba', name: 'Qwen2.5-Coder-32B', desc: 'World-class open coding assistant rivaling GPT-4o on HumanEval.', think: true, vision: false, ctx: 128000 },
  { category: 'Alibaba Qwen', family: 'alibaba', name: 'Qwen2.5-Math-72B', desc: 'Mathematical problem-solving model with step-by-step reasoning.', think: true, vision: false, ctx: 128000 },
  { category: 'Alibaba Qwen', family: 'alibaba', name: 'Qwen2-VL-7B', desc: 'Vision-language model capable of reading documents and high-res video.', think: false, vision: true, ctx: 32768 },
  { category: 'Alibaba Qwen', family: 'alibaba', name: 'Qwen Image 2.1 Turbo', desc: 'Rapid text-to-image and visual editing engine by Alibaba.', think: false, vision: true, ctx: 32768 },
  { category: 'Alibaba Qwen', family: 'alibaba', name: 'Qwen-Audio', desc: 'Universal audio understanding and speech transcription model.', think: false, vision: false, ctx: 32768 },
  { category: 'Alibaba Qwen', family: 'alibaba', name: 'Tongyi Qwen-Max', desc: 'Commercial proprietary cloud model powering Alibaba enterprise AI.', think: true, vision: true, ctx: 128000 },

  // 7. Mistral AI (12 Models)
  { category: 'Mistral AI', family: 'mistral', name: 'Mistral Large 2', desc: 'Flagship 123B model with elite multilingual and coding capabilities.', think: true, vision: false, ctx: 128000 },
  { category: 'Mistral AI', family: 'mistral', name: 'Mistral Large', desc: 'Top-tier enterprise reasoning model with native JSON output.', think: false, vision: false, ctx: 32768 },
  { category: 'Mistral AI', family: 'mistral', name: 'Mistral Pixtral Large', desc: '124B frontier multimodal vision-language model by Mistral AI.', think: true, vision: true, ctx: 128000 },
  { category: 'Mistral AI', family: 'mistral', name: 'Pixtral 12B', desc: 'Native multimodal 12B model with exceptional chart and diagram comprehension.', think: false, vision: true, ctx: 128000 },
  { category: 'Mistral AI', family: 'mistral', name: 'Codestral 22B', desc: 'Specialized 22B open-weights coding assistant for 80+ programming languages.', think: false, vision: false, ctx: 32768 },
  { category: 'Mistral AI', family: 'mistral', name: 'Codestral Mamba', desc: 'State-space architecture model offering linear time inference on code.', think: false, vision: false, ctx: 256000 },
  { category: 'Mistral AI', family: 'mistral', name: 'Mistral 8x22B', desc: 'Open-weights sparse mixture of experts model with high throughput.', think: false, vision: false, ctx: 65536 },
  { category: 'Mistral AI', family: 'mistral', name: 'Mixtral 8x7B', desc: 'Landmark sparse Mixture-of-Experts architecture model.', think: false, vision: false, ctx: 32768 },
  { category: 'Mistral AI', family: 'mistral', name: 'Mistral 7B', desc: 'Pioneering 7B parameter open-weights language model.', think: false, vision: false, ctx: 8192 },
  { category: 'Mistral AI', family: 'mistral', name: 'Mistral Nemo', desc: '12B model built in collaboration with NVIDIA with 128k context.', think: false, vision: false, ctx: 128000 },
  { category: 'Mistral AI', family: 'mistral', name: 'Mathstral', desc: '7B model specialized in scientific discovery and advanced mathematics.', think: true, vision: false, ctx: 32768 },
  { category: 'Mistral AI', family: 'mistral', name: 'Ministral 8B', desc: 'Low-latency edge model for on-device reasoning and tool use.', think: false, vision: false, ctx: 128000 },

  // 8. DeepSeek & Chinese Tech Labs (20 Models)
  { category: 'DeepSeek & Chinese Tech Labs', family: 'deepseek', name: 'DeepSeek R1', desc: 'Breakthrough open-weights reasoning model with chain-of-thought verification.', think: true, vision: false, ctx: 128000 },
  { category: 'DeepSeek & Chinese Tech Labs', family: 'deepseek', name: 'DeepSeek V4.1 Flash', desc: 'Fourth-generation ultra-fast mixture-of-experts model.', think: true, vision: false, ctx: 256000 },
  { category: 'DeepSeek & Chinese Tech Labs', family: 'deepseek', name: 'DeepSeek V4 Pro', desc: 'Flagship enterprise architecture delivering high cognitive depth.', think: true, vision: true, ctx: 256000 },
  { category: 'DeepSeek & Chinese Tech Labs', family: 'deepseek', name: 'DeepSeek V3', desc: '671B MoE model with multi-head latent attention.', think: false, vision: false, ctx: 128000 },
  { category: 'DeepSeek & Chinese Tech Labs', family: 'deepseek', name: 'DeepSeek Coder V2', desc: 'Open coding model supporting 338 programming languages.', think: false, vision: false, ctx: 128000 },
  { category: 'DeepSeek & Chinese Tech Labs', family: 'deepseek', name: 'DeepSeek-V2.5', desc: 'Unified chat and coding model combining general and technical tasks.', think: false, vision: false, ctx: 128000 },
  { category: 'DeepSeek & Chinese Tech Labs', family: 'zhipu', name: 'GLM 5.3', desc: 'Fifth-generation general language model by Zhipu AI.', think: true, vision: true, ctx: 256000 },
  { category: 'DeepSeek & Chinese Tech Labs', family: 'zhipu', name: 'GLM 5.2', desc: 'High capability bilingual Chinese-English foundational model.', think: false, vision: true, ctx: 128000 },
  { category: 'DeepSeek & Chinese Tech Labs', family: 'zhipu', name: 'GLM 5.1', desc: 'Optimized enterprise dialogue and document processing engine.', think: false, vision: false, ctx: 128000 },
  { category: 'DeepSeek & Chinese Tech Labs', family: 'zhipu', name: 'GLM 5.0', desc: 'Fifth-generation foundational architecture by Zhipu AI.', think: false, vision: false, ctx: 128000 },
  { category: 'DeepSeek & Chinese Tech Labs', family: 'zhipu', name: 'GLM 4.7', desc: 'High-speed reasoning model with web search grounding.', think: false, vision: false, ctx: 128000 },
  { category: 'DeepSeek & Chinese Tech Labs', family: 'moonshot', name: 'Kimi K3', desc: 'Frontier model with million-token native context and reasoning.', think: true, vision: true, ctx: 1000000 },
  { category: 'DeepSeek & Chinese Tech Labs', family: 'moonshot', name: 'Kimi K2.7 Code', desc: 'Specialized programming model with long repository context.', think: true, vision: false, ctx: 500000 },
  { category: 'DeepSeek & Chinese Tech Labs', family: 'moonshot', name: 'Kimi K2.6', desc: 'Ultra-long context model for deep document analysis.', think: false, vision: false, ctx: 500000 },
  { category: 'DeepSeek & Chinese Tech Labs', family: 'moonshot', name: 'Kimi K2.5', desc: 'High-capacity conversational model by Moonshot AI.', think: false, vision: false, ctx: 200000 },
  { category: 'DeepSeek & Chinese Tech Labs', family: 'minimax', name: 'MiniMax M3.1 Flash', desc: 'Low-latency conversational and character generation model.', think: false, vision: false, ctx: 256000 },
  { category: 'DeepSeek & Chinese Tech Labs', family: 'minimax', name: 'MiniMax M3', desc: 'Flagship multilingual dialogue engine by MiniMax.', think: false, vision: false, ctx: 256000 },
  { category: 'DeepSeek & Chinese Tech Labs', family: 'minimax', name: 'MiniMax M2.7', desc: 'Efficient enterprise language model with emotional nuance.', think: false, vision: false, ctx: 128000 },
  { category: 'DeepSeek & Chinese Tech Labs', family: 'stepfun', name: 'Step 5 Preview', desc: 'Next-generation multimodal model by StepFun.', think: true, vision: true, ctx: 256000 },
  { category: 'DeepSeek & Chinese Tech Labs', family: 'stepfun', name: 'Step 3.7', desc: 'High performance step reasoning model with image grounding.', think: false, vision: true, ctx: 128000 },

  // 9. NVIDIA & Hardware Pioneers (14 Models)
  { category: 'NVIDIA & Hardware Pioneers', family: 'nvidia', name: 'Nemotron 3.5 Bolt (74B)', desc: '74B high-throughput reasoning model tuned for NVIDIA enterprise GPUs.', think: true, vision: false, ctx: 128000 },
  { category: 'NVIDIA & Hardware Pioneers', family: 'nvidia', name: 'Nemotron Nano 9B V2', desc: 'Compact edge model optimized with TensorRT-LLM acceleration.', think: false, vision: false, ctx: 32768 },
  { category: 'NVIDIA & Hardware Pioneers', family: 'nvidia', name: 'Nemotron Labs Dory 1.0 (4B)', desc: 'Ultra-fast 4B research model for agentic workflow orchestration.', think: false, vision: false, ctx: 32768 },
  { category: 'NVIDIA & Hardware Pioneers', family: 'nvidia', name: 'Nemotron Super', desc: 'Massive scale foundational model built for scientific computing.', think: true, vision: true, ctx: 256000 },
  { category: 'NVIDIA & Hardware Pioneers', family: 'nvidia', name: 'Nemotron Ultra', desc: 'Ultra-high parameter architecture with advanced synthetic alignment.', think: true, vision: true, ctx: 256000 },
  { category: 'NVIDIA & Hardware Pioneers', family: 'nvidia', name: 'Megatron-LM', desc: 'Pioneering large-scale transformer model trained with Megatron parallelism.', think: false, vision: false, ctx: 8192 },
  { category: 'NVIDIA & Hardware Pioneers', family: 'nvidia', name: 'NVLM-1.0-D-72B', desc: '72B multimodal vision-language model rivaling GPT-4o.', think: true, vision: true, ctx: 128000 },
  { category: 'NVIDIA & Hardware Pioneers', family: 'nvidia', name: 'ChipNeMo', desc: 'Domain-adapted model for semiconductor and chip design automation.', think: true, vision: false, ctx: 65536 },
  { category: 'NVIDIA & Hardware Pioneers', family: 'cerebras', name: 'Celeris-1', desc: 'Ultra-low latency model compiled for Cerebras Wafer-Scale Engines.', think: false, vision: false, ctx: 65536 },
  { category: 'NVIDIA & Hardware Pioneers', family: 'k2-horizon', name: 'K2 Horizon 375B', desc: '375B parameter open-weights supercomputer scale model.', think: true, vision: false, ctx: 128000 },
  { category: 'NVIDIA & Hardware Pioneers', family: 'mercury', name: 'Mercury 3', desc: 'Next-generation accelerated mathematical computation model.', think: true, vision: false, ctx: 128000 },
  { category: 'NVIDIA & Hardware Pioneers', family: 'mercury', name: 'Mercury 2.5', desc: 'High-speed reasoning engine for code and quantitative analysis.', think: false, vision: false, ctx: 65536 },
  { category: 'NVIDIA & Hardware Pioneers', family: 'mercury', name: 'Inception Mercury 3', desc: 'Collaborative architectural research model for tensor operations.', think: true, vision: false, ctx: 128000 },
  { category: 'NVIDIA & Hardware Pioneers', family: 'macaron', name: 'Macaron V1', desc: 'High-speed sequence-to-sequence hardware co-designed model.', think: false, vision: false, ctx: 32768 },

  // 10. Cohere & Specialized Enterprise Labs (16 Models)
  { category: 'Cohere & Specialized Enterprise Labs', family: 'cohere', name: 'Command R+', desc: 'Enterprise-grade RAG and tool-use model with multi-step reasoning.', think: true, vision: false, ctx: 128000 },
  { category: 'Cohere & Specialized Enterprise Labs', family: 'cohere', name: 'Command R', desc: 'Scalable model optimized for enterprise search and document retrieval.', think: false, vision: false, ctx: 128000 },
  { category: 'Cohere & Specialized Enterprise Labs', family: 'cohere', name: 'Command A+', desc: 'Agentic workflow model specialized in API calls and database queries.', think: true, vision: false, ctx: 128000 },
  { category: 'Cohere & Specialized Enterprise Labs', family: 'cohere', name: 'Command Light', desc: 'Low-latency version of Command for high-volume customer service.', think: false, vision: false, ctx: 4096 },
  { category: 'Cohere & Specialized Enterprise Labs', family: 'cohere', name: 'Cohere Embed English v3.0', desc: 'Leading semantic search embedding model for English text.', think: false, vision: false, ctx: 8192 },
  { category: 'Cohere & Specialized Enterprise Labs', family: 'cohere', name: 'Cohere Embed Multilingual v3.0', desc: 'Cross-lingual semantic search embedding model for 100+ languages.', think: false, vision: false, ctx: 8192 },
  { category: 'Cohere & Specialized Enterprise Labs', family: 'cohere', name: 'Cohere Reranker v3.0', desc: 'Neural reranker providing immediate precision boost to search results.', think: false, vision: false, ctx: 8192 },
  { category: 'Cohere & Specialized Enterprise Labs', family: 'ai21', name: 'Jamba 1.5 Large (AI21 Labs)', desc: 'Hybrid SSM-Transformer model delivering 256k context efficiency.', think: true, vision: false, ctx: 256000 },
  { category: 'Cohere & Specialized Enterprise Labs', family: 'ai21', name: 'Jamba 1.5 Mini (AI21 Labs)', desc: 'Fast, lightweight hybrid architecture model for document processing.', think: false, vision: false, ctx: 256000 },
  { category: 'Cohere & Specialized Enterprise Labs', family: 'ai21', name: 'Jurassic-2 Ultra (AI21 Labs)', desc: 'Advanced natural language processing foundation model by AI21 Labs.', think: false, vision: false, ctx: 8192 },
  { category: 'Cohere & Specialized Enterprise Labs', family: 'ai21', name: 'Jurassic-2 Mid (AI21 Labs)', desc: 'Balanced language model for text generation and summarization.', think: false, vision: false, ctx: 8192 },
  { category: 'Cohere & Specialized Enterprise Labs', family: 'reka', name: 'Reka Core', desc: 'Frontier multimodal model trained from scratch on text, audio, and video.', think: true, vision: true, ctx: 128000 },
  { category: 'Cohere & Specialized Enterprise Labs', family: 'reka', name: 'Reka Flash', desc: 'Fast, efficient multimodal model for real-time document and image tasks.', think: false, vision: true, ctx: 128000 },
  { category: 'Cohere & Specialized Enterprise Labs', family: 'reka', name: 'Reka Edge 2603', desc: 'Compact on-device multimodal model for edge vision-language reasoning.', think: false, vision: true, ctx: 32768 },
  { category: 'Cohere & Specialized Enterprise Labs', family: 'upstage', name: 'Upstage Solar Pro', desc: 'High-capability bilingual enterprise model with depth upscaling.', think: false, vision: false, ctx: 65536 },
  { category: 'Cohere & Specialized Enterprise Labs', family: 'upstage', name: 'Upstage Solar Decide', desc: 'Reasoning model specialized in corporate decision matrices and evaluations.', think: true, vision: false, ctx: 65536 },

  // 11. Open Source & Community Innovation (16 Models)
  { category: 'Open Source & Community Innovation', family: 'xai', name: 'Grok 4.5', desc: 'Advanced truth-seeking conversational AI by xAI with real-time knowledge.', think: true, vision: true, ctx: 256000 },
  { category: 'Open Source & Community Innovation', family: 'xai', name: 'Grok 4', desc: 'Frontier general intelligence system with deep logical comprehension.', think: true, vision: true, ctx: 128000 },
  { category: 'Open Source & Community Innovation', family: 'xai', name: 'Grok 3', desc: 'Third-generation Grok reasoning engine with wit and humor.', think: true, vision: true, ctx: 128000 },
  { category: 'Open Source & Community Innovation', family: 'xai', name: 'Grok Voice 3.0', desc: 'Low-latency natural conversational voice model by xAI.', think: false, vision: false, ctx: 32768 },
  { category: 'Open Source & Community Innovation', family: 'openai', name: 'OpenAI gpt-oss (120b)', desc: '120B open-weights model release by OpenAI with full chain-of-thought.', think: true, vision: false, ctx: 128000 },
  { category: 'Open Source & Community Innovation', family: 'openai', name: 'OpenAI gpt-oss (20b)', desc: '20B open-weights reasoning model delivering fast, accurate inferences.', think: true, vision: false, ctx: 65536 },
  { category: 'Open Source & Community Innovation', family: 'reflection', name: 'Reflection Beam 1.0', desc: 'Self-correcting model that critiques and corrects its own outputs.', think: true, vision: false, ctx: 65536 },
  { category: 'Open Source & Community Innovation', family: 'nous', name: 'Hermes 3 Llama 3.1 405B (Nous Research)', desc: 'Open-weights flagship fine-tune with exceptional roleplay and alignment.', think: true, vision: false, ctx: 128000 },
  { category: 'Open Source & Community Innovation', family: 'nous', name: 'Hermes 2 Pro', desc: 'Pioneering function-calling open model with structured JSON parsing.', think: false, vision: false, ctx: 32768 },
  { category: 'Open Source & Community Innovation', family: 'gryphe', name: 'MythoMax-L2-13b', desc: 'Popular community merge model for creative writing and storytelling.', think: false, vision: false, ctx: 4096 },
  { category: 'Open Source & Community Innovation', family: 'openchat', name: 'OpenChat 3.5', desc: 'Open-source chat model aligned using C-RLFT on open datasets.', think: false, vision: false, ctx: 8192 },
  { category: 'Open Source & Community Innovation', family: 'bigcode', name: 'StarCoder 2', desc: 'Open code generation model trained on The Stack v2 across 600+ languages.', think: false, vision: false, ctx: 16384 },
  { category: 'Open Source & Community Innovation', family: 'databricks', name: 'DBRX Instruct (Databricks)', desc: '132B open mixture-of-experts model built for enterprise data analytics.', think: false, vision: false, ctx: 32768 },
  { category: 'Open Source & Community Innovation', family: 'tii', name: 'Falcon 180B (TII)', desc: '180B parameter super-scale open foundation model from Abu Dhabi.', think: false, vision: false, ctx: 4096 },
  { category: 'Open Source & Community Innovation', family: 'tii', name: 'Falcon 40B (TII)', desc: 'Landmark open weights model with multiquery attention.', think: false, vision: false, ctx: 2048 },
  { category: 'Open Source & Community Innovation', family: 'tii', name: 'Falcon 2 11B (TII)', desc: 'Second-generation vision-to-language open foundation model.', think: false, vision: true, ctx: 8192 },

  // 12. Generative Media (Image, Audio, Video) (10 Models)
  { category: 'Generative Media', family: 'stability', name: 'Stable Diffusion 3', desc: 'Diffusion Transformer text-to-image model with photorealistic fidelity.', think: false, vision: true, ctx: 8192 },
  { category: 'Generative Media', family: 'stability', name: 'Stable Diffusion XL', desc: 'Industry-standard open generative image model for high-resolution output.', think: false, vision: true, ctx: 8192 },
  { category: 'Generative Media', family: 'black-forest-labs', name: 'FLUX.1 Pro', desc: 'Top-of-the-line 12B rectified flow transformer image generation model.', think: false, vision: true, ctx: 8192 },
  { category: 'Generative Media', family: 'black-forest-labs', name: 'FLUX.1 Schnell', desc: 'Ultra-fast 4-step image synthesis model for real-time generative workflows.', think: false, vision: true, ctx: 8192 },
  { category: 'Generative Media', family: 'midjourney', name: 'Midjourney v6', desc: 'Photorealistic image synthesis with nuanced prompt interpretation.', think: false, vision: true, ctx: 8192 },
  { category: 'Generative Media', family: 'openai', name: 'Sora (Video)', desc: 'OpenAI breakthrough diffusion-transformer video generation model.', think: false, vision: true, ctx: 16384 },
  { category: 'Generative Media', family: 'google', name: 'Veo 3 (Video)', desc: 'High-definition cinematic video synthesis model by Google DeepMind.', think: false, vision: true, ctx: 16384 },
  { category: 'Generative Media', family: 'xai', name: 'Grok Imagine Video 1.5 Lite', desc: 'High-speed generative video rendering system by xAI.', think: false, vision: true, ctx: 16384 },
  { category: 'Generative Media', family: 'generative-media', name: 'Nano Banana (Image/Design)', desc: 'Lightweight generative design and image compositing model.', think: false, vision: true, ctx: 8192 },
  { category: 'Generative Media', family: 'elevenlabs', name: 'ElevenLabs Multilingual v2', desc: 'Natural voice synthesis and text-to-speech across 29 languages.', think: false, vision: false, ctx: 8192 }
];

function toModelId(name) {
  let s = name.toLowerCase();
  s = s.replace(/\+/g, '-plus');
  s = s.replace(/[\(\)]/g, ' ');
  s = s.trim().replace(/[\s_.]+/g, '-');
  s = s.replace(/[^a-z0-9-]/g, '');
  s = s.replace(/-+/g, '-');
  return s.replace(/^-|-$/g, '');
}

const catalog = rawList.map(item => {
  const modelId = toModelId(item.name);
  const capabilities = ['completion', 'cloud'];
  if (item.think) capabilities.push('thinking');
  if (item.vision) capabilities.push('vision');
  capabilities.push('tools');

  return {
    name: modelId,
    model: modelId,
    display_name: item.name,
    modified_at: new Date().toISOString(),
    size: 0,
    digest: 'poe-' + modelId,
    details: {
      parent_model: item.name,
      format: 'poe',
      family: item.family,
      families: [item.family, 'cloud', 'poe'],
      parameter_size: 'POE API',
      quantization_level: 'cloud',
      context_window: (item.ctx / 1000) + 'k'
    },
    capabilities,
    description: item.desc,
    context_length: item.ctx,
    metadata: {
      display_name: item.name,
      owner: item.category,
      category: item.category,
      url: null,
      pricing: null
    }
  };
});

const storageDir = path.join(__dirname, '..', 'Storage');
const catalogPath = path.join(storageDir, 'models', 'catalog.json');
const descriptorsDir = path.join(storageDir, 'models', 'descriptors');

// Write catalog.json
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log('Successfully wrote ' + catalog.length + ' models to ' + catalogPath);

// Clean and write descriptors
if (fs.existsSync(descriptorsDir)) {
  fs.readdirSync(descriptorsDir).forEach(f => fs.unlinkSync(path.join(descriptorsDir, f)));
} else {
  fs.mkdirSync(descriptorsDir, { recursive: true });
}

catalog.forEach(m => {
  const filePath = path.join(descriptorsDir, m.name + '.json');
  fs.writeFileSync(filePath, JSON.stringify(m, null, 2), 'utf8');
});
console.log('Successfully wrote ' + catalog.length + ' descriptor files to ' + descriptorsDir);
