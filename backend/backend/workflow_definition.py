from enum import Enum


class NodeType(str, Enum):
    STANDARD = "Standard"
    GENERATOR = "Generator"


class HITLMode(str, Enum):
    VARL = "VARL"
    SCA = "SCA"
    AVL = "AVL"

# Standardized Keys for Raw Generation
KEY_PRIMARY_ARTIFACT = "primary_artifact"
KEY_CANDIDATES = "candidates"
KEY_ANALYSIS = "comparative_analysis"
KEY_CRITIQUES = "critiques"
KEY_ID = "id"
# Fix 3.1/3.2: Standardized keys for final HITL outputs
KEY_SCA_OUTPUT = "sca_output_wrapper"
KEY_SELECTED_ITEM = "selected_item"
KEY_SELECTED_ITEMS = "selected_items"
# Stage metadata keys
KEY_STAGE_ID = "stage_id"
KEY_STAGE_NAME = "stage_name"

# Workflow Structure Constants
PREVIOUS_IN_TASK = "__PREVIOUS_IN_TASK__"
# Fix 2.1: Used for resolving inter-task dependencies
TERMINAL_NODE_SUFFIX = ".2.2.2"

WORKFLOW_DEFINITION = {
    "name": "O-Award Modeling Workflow",
    "structure": [
        {
            "id": "1.1.1",
            "name": "Problem Deconstruction and Mathematical Formulation",
            "phase": "Phase 1: Strategic Analysis & Macro Architecture",
            KEY_STAGE_ID: "1.1",
            KEY_STAGE_NAME: "Strategic Definition",
            "type": NodeType.STANDARD,
            "hitl_mode": HITLMode.AVL,
            "dependencies": {},
            "external_inputs": ["Problem Statement", "Datasets"],
        },
        {
            "id": "1.1.2",
            "name": "Architecture Design and Task Decomposition",
            "phase": "Phase 1: Strategic Analysis & Macro Architecture",
            KEY_STAGE_ID: "1.1",
            KEY_STAGE_NAME: "Strategic Definition",
            "type": NodeType.GENERATOR,
            "hitl_mode": HITLMode.SCA,
            "dependencies": {
                "1.1.1": {"required_fields": ["Formal Problem Restatement", "Global Assumption Framework"]}
            },
            "external_inputs": [],
        },
        {
            "id": "3.1.1",
            "name": "Global Logic Integration and Strategic Narrative Construction",
            "phase": "Phase 3: Global Synthesis & O-Award Paper Forging",
            KEY_STAGE_ID: "3.1",
            KEY_STAGE_NAME: "Global Logic & Narrative",
            "type": NodeType.STANDARD,
            "hitl_mode": HITLMode.SCA,
            "dependencies": {
                "1.1.1": {"required_fields": ["Formal Problem Restatement"]},
                "1.1.2": {"required_fields": ["Structured Modeling Taskbook"]},
            },
            "external_inputs": [],
        },
        {
            "id": "3.1.2",
            "name": "Paper Forging and Professional Optimization",
            "phase": "Phase 3: Global Synthesis & O-Award Paper Forging",
            KEY_STAGE_ID: "3.1",
            KEY_STAGE_NAME: "Global Logic & Narrative",
            "type": NodeType.STANDARD,
            "hitl_mode": HITLMode.VARL,
            "dependencies": {
                "3.1.1": {"required_fields": ["Thesis Statement", "Narrative Outline"]}
            },
            "external_inputs": [],
        },
    ],
}

PHASE_2_TEMPLATE = {
    ".2.1.1": {
        "stage_name_prefix": "Data & Model Generation",
        "name_prefix": "Data Insights and Candidate Model Generation",
        "type": NodeType.STANDARD,
        "hitl_mode": HITLMode.SCA,
        "inputs": {},
        # Output is the standardized SCA wrapper
        "outputs": [KEY_SCA_OUTPUT],
        "inherits_external_inputs": True,
    },
    ".2.1.2": {
        "stage_name_prefix": "Data & Model Generation",
        "name_prefix": "Mathematical Formulation and Computational Design",
        "type": NodeType.STANDARD,
        "hitl_mode": HITLMode.AVL,
        "inputs": {
            # Depends on the SCA wrapper from 2.1.1
            PREVIOUS_IN_TASK: [KEY_SCA_OUTPUT]
        },
        # Concrete output keys used by the simulator
        "outputs": [
            "math_formulation",
            "execution_blueprint",
        ],
        "inherits_external_inputs": False,
    },
    ".2.2.1": {
        "stage_name_prefix": "Code & Execution",
        "name_prefix": "Code Generation and Automatic Execution",
        "type": NodeType.STANDARD,
        "hitl_mode": HITLMode.VARL,
        "inputs": {
            # Depends on the blueprint from 2.1.2
            PREVIOUS_IN_TASK: ["execution_blueprint"]
        },
        # Concrete output keys used by the simulator
        "outputs": [
            "raw_results",
            "vv_data",
            "sensitivity_data"
        ],
        "inherits_external_inputs": True,
    },
    # This definition corresponds to TERMINAL_NODE_SUFFIX
    TERMINAL_NODE_SUFFIX: {
        "stage_name_prefix": "Code & Execution",
        "name_prefix": "Robustness Analysis and Strategic Visualization",
        "type": NodeType.STANDARD,
        "hitl_mode": HITLMode.SCA,
        "inputs": {
            # Depends on the data emitted by 2.2.1
            PREVIOUS_IN_TASK: [
                "raw_results",
                "vv_data",
                "sensitivity_data"
            ]
        },
        # Concrete output keys used by the simulator, plus the SCA wrapper
        "outputs": [
            KEY_SCA_OUTPUT,
            "vv_report",
            "key_output_doc",
        ],
        "inherits_external_inputs": False,
    },
}
