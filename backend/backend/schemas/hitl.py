from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class HITLActionType(str, Enum):
    CONTINUE = "Continue"
    REJECT_WITH_FEEDBACK = "RejectAndProvideModificationComments"
    DISCARD = "Discard"


class AdjudicationDecision(str, Enum):
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"


class Adjudication(BaseModel):
    critique_id: str
    decision: AdjudicationDecision
    comment: Optional[str] = None


class HITLSubmission(BaseModel):
    action: HITLActionType
    feedback_comment: Optional[str] = None
    interaction_data: Optional[Dict[str, Any]] = None


class ExecutionRequest(BaseModel):
    modification_comments: Optional[str] = None
    base_version_id: Optional[int] = None

