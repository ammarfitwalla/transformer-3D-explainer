/* ==========================================================================
   js/data.js — Complete 3D Component Registry, Beginner Explanations &
   Simple Step-by-Step Data Transformation ("What Happens to the Data Here")
   Example Sentence Flowing Through: "The coffee is" ➔ predicts "hot"
   ========================================================================== */

window.TransformerArchData = {
  tourOrder: [
    'inputs',
    'input_embedding',
    'pos_encoding_enc',
    'encoder_shell',
    'enc_mha',
    'enc_add_norm_1',
    'enc_ffn',
    'enc_add_norm_2',
    'outputs_shifted',
    'output_embedding',
    'pos_encoding_dec',
    'decoder_shell',
    'dec_masked_mha',
    'dec_add_norm_1',
    'dec_cross_mha',
    'dec_add_norm_2',
    'dec_ffn',
    'dec_add_norm_3',
    'linear_layer',
    'softmax_layer',
    'output_probs'
  ],

  components: {
    inputs: {
      id: 'inputs',
      stepNum: 1,
      label: 'Inputs',
      category: 'Input Stream',
      tagStyle: 'tag-io',
      colorHex: 0x475569,
      pos: [-5.2, -7.8, 0],
      size: [3.2, 0.55, 1.5],
      shape: 'pill',
      dataFlow: {
        badge: '📝 Raw Prompt ➔ Word Tickets',
        before: '"The coffee is"',
        action: 'Split into 3 tokens',
        after: '["The" #104] ["coffee" #402] ["is" #219]'
      },
      summary: [
        'This is where your raw prompt enters the model (for example, "The coffee is").',
        'The model chops the sentence into separate word pieces called tokens and stamps each word with its dictionary ID number.'
      ],
      whyImportant: 'Turns human words into numerical IDs that can flow upward into the Encoder tower.'
    },

    input_embedding: {
      id: 'input_embedding',
      stepNum: 2,
      label: 'Input Embedding',
      category: 'Encoder Base',
      tagStyle: 'tag-purple',
      colorHex: 0xC49BFF,
      borderHex: 0x7E22CE,
      pos: [-5.2, -6.1, 0],
      size: [4.2, 0.9, 2.2],
      shape: 'box',
      dataFlow: {
        badge: '🔢 Token IDs ➔ Meaning Vectors',
        before: 'ID #402 ("coffee")',
        action: 'Look up trait numbers',
        after: '"coffee" = [0.95 Drink, 0.85 Warm]'
      },
      summary: [
        'Converts each plain word ID into a list of numbers (a vector) that captures what the word actually means.',
        'Words with similar meanings—like "coffee" and "tea"—get very similar number patterns.'
      ],
      whyImportant: 'Gives the model a mathematical sense of each word\'s meaning and flavor.'
    },

    pos_encoding_enc: {
      id: 'pos_encoding_enc',
      stepNum: 3,
      label: 'Positional Encoding ⊕',
      category: 'Encoder Base',
      tagStyle: 'tag-gold',
      colorHex: 0xFDE047,
      borderHex: 0xCA8A04,
      pos: [-5.2, -4.4, 0],
      size: [1.1, 1.1, 1.1],
      shape: 'pos_junction',
      sideOffset: -2.9,
      dataFlow: {
        badge: '📍 Add Word Order Stamp',
        before: '["The"] ["coffee"] ["is"] (no order)',
        action: 'Add ⊕ seat wave',
        after: '[Seat #1: The] [Seat #2: coffee] [Seat #3: is]'
      },
      summary: [
        'Because a Transformer reads all words at the same time instead of left-to-right, it needs a way to know word order.',
        'Positional Encoding adds a unique wave pattern (the yellow diamond + ⊕ circle) onto each word so Seat #1, #2, and #3 stay distinct.'
      ],
      whyImportant: 'Without this, "The coffee is" and "Is the coffee" would look identical to the model.'
    },

    encoder_shell: {
      id: 'encoder_shell',
      stepNum: 4,
      label: '🖥️ Encoder',
      category: 'Left Tower',
      tagStyle: 'tag-dark',
      colorHex: 0x67E8F9,
      pos: [-5.2, -0.2, 0],
      size: [5.8, 6.8, 3.6],
      shape: 'enclosure_encoder',
      dataFlow: {
        badge: '🧠 Reading Tower Overview',
        before: '3 separate word vectors',
        action: 'Connect & refine meaning',
        after: 'Deep context summary of "The coffee is"'
      },
      summary: [
        'The Encoder is the "Reading & Understanding Tower" (the cyan box on the left).',
        'It takes the 3 word vectors, lets them share context through Attention and Feed-Forward blocks, and builds a complete summary of the input.'
      ],
      whyImportant: 'Understands the full input sentence before handing that knowledge across the bridge to the Decoder.'
    },

    enc_mha: {
      id: 'enc_mha',
      stepNum: 5,
      label: 'Multi-Head Attention',
      category: 'Encoder Layer',
      tagStyle: 'tag-purple',
      colorHex: 0xC49BFF,
      borderHex: 0x7E22CE,
      pos: [-5.2, -2.3, 0],
      size: [4.2, 1.1, 2.2],
      shape: 'box',
      dataFlow: {
        badge: '🔗 Words Connect to Each Other',
        before: '"is" doesn\'t know what noun it describes',
        action: 'Compare Query · Key · Value',
        after: '"is" links 85% to "coffee" (Hot Drink!)'
      },
      summary: [
        'Notice the 3 arrows entering the bottom: each word splits into a Query (what it looks for), a Key (what it offers), and a Value (its meaning).',
        'Here, the word "is" looks across the sentence and links strongly to "coffee" so it knows we are describing a beverage.'
      ],
      whyImportant: 'Lets words talk to each other to figure out grammar and context.'
    },

    enc_add_norm_1: {
      id: 'enc_add_norm_1',
      stepNum: 6,
      label: 'Add & Normalize',
      category: 'Encoder Layer',
      tagStyle: 'tag-orange',
      colorHex: 0xFBBF6B,
      borderHex: 0xB45309,
      pos: [-5.2, -0.7, 0],
      size: [4.2, 0.85, 2.2],
      shape: 'box',
      dataFlow: {
        badge: '➰ Blend Skip Loop + Balance',
        before: 'Original Word + New Attention Clue',
        action: 'Add together & normalize',
        after: 'Balanced vector: "is (describing coffee)"'
      },
      summary: [
        'Follow the orange pipe looping around the outside of Multi-Head Attention: that is a Residual Skip Connection.',
        '"Add" blends the original word with the new Attention clues so nothing is lost, and "Normalize" keeps the numbers in a healthy range.'
      ],
      whyImportant: 'Prevents the original word meaning from fading away as data travels upward.'
    },

    enc_ffn: {
      id: 'enc_ffn',
      stepNum: 7,
      label: 'Feed Forward',
      category: 'Encoder Layer',
      tagStyle: 'tag-pink',
      colorHex: 0xF9A8D4,
      borderHex: 0xBE185D,
      pos: [-5.2, 0.9, 0],
      size: [4.2, 0.95, 2.2],
      shape: 'box',
      dataFlow: {
        badge: '💡 Personal Thinking Booth',
        before: 'Context: Subject = "coffee", Verb = "is"',
        action: 'Fire knowledge neurons',
        after: 'Activates trait: "Expect temperature/taste"'
      },
      summary: [
        'After words share context in Attention, each word passes through this Feed-Forward neural network (the pink block).',
        'It acts like a thinking booth that activates patterns learned during training (e.g., coffee + is usually describes temperature or taste).'
      ],
      whyImportant: 'Sharpens the gathered attention clues into concrete factual features.'
    },

    enc_add_norm_2: {
      id: 'enc_add_norm_2',
      stepNum: 8,
      label: 'Add & Normalize',
      category: 'Encoder Top',
      tagStyle: 'tag-orange',
      colorHex: 0xFBBF6B,
      borderHex: 0xB45309,
      pos: [-5.2, 2.4, 0],
      size: [4.2, 0.85, 2.2],
      shape: 'box',
      dataFlow: {
        badge: '🌉 Ready to Cross the Bridge',
        before: 'Word features + Feed-Forward insight',
        action: 'Final Encoder Add & Norm',
        after: ' Rich Memory (Keys & Values) sent to Bridge ➔'
      },
      summary: [
        'Combines the Feed-Forward result with its outer skip-connection loop and normalizes the numbers one last time.',
        'From the top of this block, the finished Encoder memory travels across the cyan bridge right into the Decoder!'
      ],
      whyImportant: 'Produces the final Encoder memory that guides the Decoder\'s writing.'
    },

    outputs_shifted: {
      id: 'outputs_shifted',
      stepNum: 9,
      label: 'Outputs (shifted right)',
      category: 'Decoder Input',
      tagStyle: 'tag-io',
      colorHex: 0x475569,
      pos: [5.2, -7.8, 0],
      size: [3.6, 0.55, 1.5],
      shape: 'pill',
      dataFlow: {
        badge: '▶️ Start of Output Stream',
        before: 'Words generated so far',
        action: 'Feed into Decoder base',
        after: 'Token: [<start> "The coffee is..."]'
      },
      summary: [
        'The Decoder generates answers one word at a time. Here at the bottom right, it receives the words generated so far (starting with a <start> token).',
        'It feeds these previous words upward so the Decoder can decide what word comes next.'
      ],
      whyImportant: 'Lets the Decoder build its response step-by-step, one word after another.'
    },

    output_embedding: {
      id: 'output_embedding',
      stepNum: 10,
      label: 'Output Embedding',
      category: 'Decoder Base',
      tagStyle: 'tag-purple',
      colorHex: 0xC49BFF,
      borderHex: 0x7E22CE,
      pos: [5.2, -6.1, 0],
      size: [4.2, 0.9, 2.2],
      shape: 'box',
      dataFlow: {
        badge: '🔢 Output Words ➔ Vectors',
        before: 'Output token IDs',
        action: 'Convert to meaning vectors',
        after: 'Vector [0.82, 0.78, ...]'
      },
      summary: [
        'Just like Input Embedding on the left, this turns the already-generated output words into meaning vectors.',
        'Each word becomes a list of trait numbers that the Decoder layers can work with.'
      ],
      whyImportant: 'Translates the words written so far into numerical vectors.'
    },

    pos_encoding_dec: {
      id: 'pos_encoding_dec',
      stepNum: 11,
      label: 'Positional Encoding ⊕',
      category: 'Decoder Base',
      tagStyle: 'tag-gold',
      colorHex: 0xFDE047,
      borderHex: 0xCA8A04,
      pos: [5.2, -4.4, 0],
      size: [1.1, 1.1, 1.1],
      shape: 'pos_junction',
      sideOffset: 2.9,
      dataFlow: {
        badge: '📍 Stamp Output Word Order',
        before: 'Output word vectors',
        action: 'Add ⊕ position wave',
        after: 'Position-stamped output vectors'
      },
      summary: [
        'Stamps the exact word position (1st word, 2nd word, 3rd word) onto the Decoder\'s word vectors using the yellow diamond wave.',
        'Ensures the Decoder keeps track of the exact order of the words it has written so far.'
      ],
      whyImportant: 'Keeps the generated sentence in proper grammatical order.'
    },

    decoder_shell: {
      id: 'decoder_shell',
      stepNum: 12,
      label: '🔒 Decoder',
      category: 'Right Tower',
      tagStyle: 'tag-dark',
      colorHex: 0xF472B6,
      pos: [5.2, 0.95, 0],
      size: [5.8, 9.2, 3.6],
      shape: 'enclosure_decoder',
      dataFlow: {
        badge: '✍️ Writing & Prediction Tower',
        before: 'Partial output + Encoder bridge memory',
        action: '3 stacked sub-layers refine next word',
        after: 'Final hidden state ready to score vocabulary'
      },
      summary: [
        'The Decoder is the "Writing & Generation Tower" (the pink box on the right).',
        'It combines what it has written so far with the Encoder\'s knowledge bridge to predict the best next word.'
      ],
      whyImportant: 'Generates the final output text one word at a time.'
    },

    dec_masked_mha: {
      id: 'dec_masked_mha',
      stepNum: 13,
      label: 'Masked Multi-Head Attention',
      category: 'Decoder Sub-Layer 1',
      tagStyle: 'tag-purple',
      colorHex: 0xC49BFF,
      borderHex: 0x7E22CE,
      pos: [5.2, -2.3, 0],
      size: [4.2, 1.15, 2.2],
      shape: 'box',
      dataFlow: {
        badge: '🔒 Look Back Only (No Peeking)',
        before: 'Current position #3',
        action: 'Attend to #1 & #2 · Mask out #4+',
        after: 'Past context gathered [100% causal]'
      },
      summary: [
        'Lets each word in the Decoder look back at earlier words it already wrote, while a "Mask" (the lock icon) blocks future words.',
        'This prevents the model from cheating by peeking ahead at future answers during training.'
      ],
      whyImportant: 'Ensures the model only uses past words to predict the next word.'
    },

    dec_add_norm_1: {
      id: 'dec_add_norm_1',
      stepNum: 14,
      label: 'Add & Normalize',
      category: 'Decoder Sub-Layer 1',
      tagStyle: 'tag-orange',
      colorHex: 0xFBBF6B,
      borderHex: 0xB45309,
      pos: [5.2, -0.7, 0],
      size: [4.2, 0.85, 2.2],
      shape: 'box',
      dataFlow: {
        badge: '➰ Stabilize Decoder Query',
        before: 'Masked Attention + Skip Loop',
        action: 'Add & Normalize',
        after: 'Clean Query ready to ask Encoder'
      },
      summary: [
        'Adds the original Decoder signal (via the right-side skip pipe) to the Masked Attention output and normalizes the numbers.',
        'Prepares a clean Query vector to send upward into the Cross-Attention bridge block.'
      ],
      whyImportant: 'Stabilizes the Decoder stream before it consults the Encoder bridge.'
    },

    dec_cross_mha: {
      id: 'dec_cross_mha',
      stepNum: 15,
      label: 'Multi-Head Attention',
      category: 'Decoder Cross-Attention',
      tagStyle: 'tag-purple',
      colorHex: 0xC49BFF,
      borderHex: 0x7E22CE,
      pos: [5.2, 0.9, 0],
      size: [4.2, 1.1, 2.2],
      shape: 'box',
      dataFlow: {
        badge: '🌉 Bridge: Encoder Meets Decoder',
        before: '2 Encoder pipes (K,V) + 1 Decoder pipe (Q)',
        action: 'Cross-Attention match',
        after: 'Pulls "coffee + warm drink" into Decoder!'
      },
      summary: [
        'Look at the 3 pipes entering the bottom: 2 come across the cyan bridge from the Encoder (Keys & Values), and 1 comes from the Decoder below (Query)!',
        'Here the Decoder asks the Encoder: "Given what I\'m writing, which input words should I focus on?" and pulls in "coffee".'
      ],
      whyImportant: 'The vital bridge where the reading tower (Encoder) hands its knowledge to the writing tower (Decoder).'
    },

    dec_add_norm_2: {
      id: 'dec_add_norm_2',
      stepNum: 16,
      label: 'Add & Normalize',
      category: 'Decoder Sub-Layer 2',
      tagStyle: 'tag-orange',
      colorHex: 0xFBBF6B,
      borderHex: 0xB45309,
      pos: [5.2, 2.4, 0],
      size: [4.2, 0.85, 2.2],
      shape: 'box',
      dataFlow: {
        badge: '➰ Merge Bridge Clues',
        before: 'Cross-Attention + Decoder Skip Loop',
        action: 'Add & Normalize',
        after: 'Unified Encoder + Decoder state'
      },
      summary: [
        'Merges the Cross-Attention insights from the bridge with the Decoder\'s skip-connection loop and normalizes the numbers.',
        'Now the data packet carries both the input prompt\'s meaning and the output\'s progress.'
      ],
      whyImportant: 'Keeps the combined Encoder + Decoder signal balanced before the final thinking step.'
    },

    dec_ffn: {
      id: 'dec_ffn',
      stepNum: 17,
      label: 'Feed Forward',
      category: 'Decoder Sub-Layer 3',
      tagStyle: 'tag-pink',
      colorHex: 0xF9A8D4,
      borderHex: 0xBE185D,
      pos: [5.2, 3.8, 0],
      size: [4.2, 0.95, 2.2],
      shape: 'box',
      dataFlow: {
        badge: '💡 Final Feature Thinking',
        before: 'Unified "The coffee is ___" vector',
        action: 'Feed-Forward neural network',
        after: 'Boosts thermal adjectives ("hot", "ready")'
      },
      summary: [
        'Passes the combined Encoder + Decoder data through a Feed-Forward neural network.',
        'Refines all the gathered clues into a sharp profile of the exact kind of word that should come next.'
      ],
      whyImportant: 'Transforms the gathered attention clues into word-prediction features.'
    },

    dec_add_norm_3: {
      id: 'dec_add_norm_3',
      stepNum: 18,
      label: 'Add & Normalize',
      category: 'Decoder Top',
      tagStyle: 'tag-orange',
      colorHex: 0xFBBF6B,
      borderHex: 0xB45309,
      pos: [5.2, 5.1, 0],
      size: [4.2, 0.85, 2.2],
      shape: 'box',
      dataFlow: {
        badge: '✨ Finished Decoder Vector',
        before: 'Feed-Forward + Skip Loop',
        action: 'Final Add & Normalize',
        after: 'Final vector [0.94, 0.96, 0.82] exits Decoder'
      },
      summary: [
        'Final residual addition and normalization at the very top of the Decoder stack.',
        'Sends the finished hidden state out of the Decoder tower and into the top prediction blocks.'
      ],
      whyImportant: 'Delivers a clean, normalized vector to the Linear vocabulary layer.'
    },

    linear_layer: {
      id: 'linear_layer',
      stepNum: 19,
      label: 'Linear',
      category: 'Output Head',
      tagStyle: 'tag-teal',
      colorHex: 0x14C8DC,
      borderHex: 0x0E7490,
      pos: [5.2, 6.7, 0],
      size: [3.8, 0.85, 2.0],
      shape: 'box',
      dataFlow: {
        badge: '📊 Score Every Dictionary Word',
        before: 'Final vector [0.94, 0.96, 0.82]',
        action: 'Project across vocabulary',
        after: 'Raw scores: hot (4.2), ready (2.9), cold (2.1)'
      },
      summary: [
        'Expands the Decoder\'s compact vector out to the size of the model\'s entire dictionary (often 50,000+ words).',
        'Gives every word in the dictionary a raw compatibility score (called a "logit").'
      ],
      whyImportant: 'Scores every candidate word in the dictionary to see how well it fits next.'
    },

    softmax_layer: {
      id: 'softmax_layer',
      stepNum: 20,
      label: 'Softmax',
      category: 'Output Head',
      tagStyle: 'tag-pink',
      colorHex: 0xF9A8D4,
      borderHex: 0xBE185D,
      pos: [5.2, 8.1, 0],
      size: [3.8, 0.85, 2.0],
      shape: 'box',
      dataFlow: {
        badge: '➗ Raw Scores ➔ Percentages',
        before: 'Scores: hot (4.2), ready (2.9), cold (2.1)',
        action: 'Softmax normalization (sums to 100%)',
        after: 'hot: 68% · ready: 22% · cold: 10%'
      },
      summary: [
        'Converts the raw Linear scores into clean percentages between 0% and 100% that all add up to 100%.',
        'Now we can clearly compare the top candidates: "hot" (68%), "ready" (22%), and "cold" (10%).'
      ],
      whyImportant: 'Turns raw mathematical scores into easy-to-read probabilities.'
    },

    output_probs: {
      id: 'output_probs',
      stepNum: 21,
      label: 'Output Probabilities',
      category: 'Final Prediction',
      tagStyle: 'tag-io',
      colorHex: 0x0F172A,
      pos: [5.2, 9.5, 0],
      size: [3.6, 0.55, 1.5],
      shape: 'pill',
      dataFlow: {
        badge: '🏆 Pick the Winning Next Word!',
        before: 'Probabilities: hot (68%), ready (22%)',
        action: 'Select top word',
        after: 'Output: "The coffee is hot" ✅'
      },
      summary: [
        'The final probability output at the very top of the Transformer!',
        'The model picks the winning word ("hot" at 68%) to complete "The coffee is hot", and can loop it back to generate the next word.'
      ],
      whyImportant: 'Produces the actual next word that appears on your screen.'
    }
  }
};
