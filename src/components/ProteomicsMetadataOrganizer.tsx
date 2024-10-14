import React, { useState, useEffect } from 'react';
import {
  Download, 
  Beaker, 
  ChevronRight, 
  Zap, 
  BarChart, 
  Database, 
  FileSearch 
} from 'lucide-react';
import { Tooltip } from './Tooltip';

// Workflow definitions
const WORKFLOWS = [
  { id: 'label_free', name: 'Label-free Quantification' },
  { id: 'tmt', name: 'TMT Quantification' },
  { id: 'itraq', name: 'iTRAQ Quantification' },
];

const WORKFLOW_STEPS = [
  { id: 'sample_prep', name: 'Sample Preparation', icon: Beaker },
  { id: 'lc', name: 'LC', icon: ChevronRight },
  { id: 'ionization', name: 'Ionization', icon: Zap },
  { id: 'ms_analysis', name: 'MS Analysis', icon: BarChart },
  { id: 'peptide_id', name: 'Peptide ID', icon: Database },
];

const QUANTIFICATION_STEPS = {
  label_free: [{ id: 'label_free_quant', name: 'Label-free Quant', icon: FileSearch }],
  tmt: [
    { id: 'tmt_labeling', name: 'TMT Labeling', icon: Beaker },
    { id: 'tmt_quant', name: 'TMT Quant', icon: FileSearch }
  ],
  itraq: [
    { id: 'itraq_labeling', name: 'iTRAQ Labeling', icon: Beaker },
    { id: 'itraq_quant', name: 'iTRAQ Quant', icon: FileSearch }
  ],
};

// Parameter definitions
const COMMON_PARAMETERS = [
  {
    id: 'sample_amount',
    name: 'Sample Amount',
    description: 'The amount of protein used for analysis',
    defaultValue: '50 μg',
    range: '5-100 μg',
    step: 'sample_prep'
  },
  {
    id: 'digestion_enzyme',
    name: 'Digestion Enzyme',
    description: 'Enzyme used to cleave proteins into peptides',
    defaultValue: 'Trypsin',
    options: ['Trypsin', 'LysC', 'Trypsin/LysC'],
    step: 'sample_prep'
  },
  {
    id: 'gradient_length',
    name: 'LC Gradient Length',
    description: 'Duration of the liquid chromatography gradient',
    defaultValue: '120 min',
    range: '30-180 min',
    step: 'lc'
  },
  {
    id: 'ms1_resolution',
    name: 'MS1 Resolution',
    description: 'Resolution setting for MS1 scans',
    defaultValue: '60,000',
    options: ['30,000', '60,000', '120,000'],
    step: 'ms_analysis'
  },
  {
    id: 'ms2_resolution',
    name: 'MS2 Resolution',
    description: 'Resolution setting for MS2 scans',
    defaultValue: '30,000',
    options: ['15,000', '30,000', '60,000'],
    step: 'ms_analysis'
  },
  {
    id: 'precursor_tol',
    name: 'Precursor Tolerance',
    description: 'Mass tolerance for precursor ions',
    defaultValue: '10 ppm',
    range: '1-20 ppm',
    step: 'ms_analysis'
  },
  {
    id: 'fragment_tol',
    name: 'Fragment Tolerance',
    description: 'Mass tolerance for fragment ions',
    defaultValue: '0.02 Da',
    range: '0.01-0.5 Da',
    step: 'ms_analysis'
  },
  {
    id: 'database',
    name: 'Protein Database',
    description: 'Reference proteome database for peptide/protein identification',
    defaultValue: 'UniProt Human',
    options: ['UniProt Human', 'UniProt Mouse', 'Custom'],
    step: 'peptide_id'
  }
];

const WORKFLOW_SPECIFIC_PARAMETERS = {
  label_free: [
    {
      id: 'lfq_min_ratio_count',
      name: 'LFQ Minimum Ratio Count',
      description: 'Minimum number of peptide ratios required for protein quantification',
      defaultValue: '2',
      range: '1-5',
      step: 'label_free_quant'
    },
  ],
  tmt: [
    {
      id: 'tmt_plex',
      name: 'TMT Plex',
      description: 'Number of TMT channels used',
      defaultValue: 'TMT 11-plex',
      options: ['TMT 6-plex', 'TMT 10-plex', 'TMT 11-plex', 'TMT 16-plex'],
      step: 'tmt_labeling'
    },
    {
      id: 'tmt_ms3',
      name: 'TMT MS3',
      description: 'Use MS3 for TMT quantification',
      defaultValue: 'Yes',
      options: ['Yes', 'No'],
      step: 'tmt_quant'
    },
  ],
  itraq: [
    {
      id: 'itraq_plex',
      name: 'iTRAQ Plex',
      description: 'Number of iTRAQ channels used',
      defaultValue: 'iTRAQ 4-plex',
      options: ['iTRAQ 4-plex', 'iTRAQ 8-plex'],
      step: 'itraq_labeling'
    },
  ],
};

interface WorkflowStep {
  id: string;
  name: string;
  icon: React.ElementType;
}

interface Parameter {
  id: string;
  name: string;
  description: string;
  defaultValue: string;
  range?: string;
  options?: string[];
  step: string;
}

interface ParameterInputProps {
  parameter: Parameter;
  value: string;
  onChange: (id: string, value: string) => void;
  isHighlighted: boolean;
}

interface WorkflowDiagramProps {
  workflowSteps: WorkflowStep[];
  highlightedStep: string | null;
  onStepHover: (step: string | null) => void;
}

const ParameterInput: React.FC<ParameterInputProps> = ({ parameter, value, onChange, isHighlighted }) => {
  return (
    <div className={`mb-4 p-4 rounded-lg transition-all duration-200 ${isHighlighted ? 'bg-blue-100' : ''}`}>
      <Tooltip content={
        <div>
          <p>{parameter.description}</p>
          {parameter.range && <p>Recommended range: {parameter.range}</p>}
          <p>Default: {parameter.defaultValue}</p>
        </div>
      }>
        <label className="block text-sm font-medium text-gray-700 mb-1 cursor-help">
          {parameter.name}
        </label>
      </Tooltip>
      {parameter.options ? (
        <select
          value={value}
          onChange={(e) => onChange(parameter.id, e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          {parameter.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(parameter.id, e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      )}
    </div>
  );
};

const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({ workflowSteps, highlightedStep, onStepHover }) => {
  return (
    <div className="flex items-center justify-center mb-8 overflow-x-auto">
      <div className="flex space-x-2">
        {workflowSteps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div
              className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 cursor-pointer
                ${highlightedStep === step.id ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              onMouseEnter={() => onStepHover(step.id)}
              onMouseLeave={() => onStepHover(null)}
            >
              <step.icon size={24} className="mb-1" />
              <span className="text-xs text-center">{step.name}</span>
            </div>
            {index < workflowSteps.length - 1 && (
              <div className="flex items-center">
                <ChevronRight size={24} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const ProteomicsMetadataOrganizer: React.FC = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState('label_free');
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [highlightedStep, setHighlightedStep] = useState<string | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [parameters, setParameters] = useState<Parameter[]>([]);

  useEffect(() => {
    const steps = [...WORKFLOW_STEPS, ...QUANTIFICATION_STEPS[selectedWorkflow as keyof typeof QUANTIFICATION_STEPS]];
    setWorkflowSteps(steps);

    const workflowParams = WORKFLOW_SPECIFIC_PARAMETERS[selectedWorkflow as keyof typeof WORKFLOW_SPECIFIC_PARAMETERS] || [];
    setParameters([...COMMON_PARAMETERS, ...workflowParams]);
  }, [selectedWorkflow]);

  const handleWorkflowChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWorkflow(e.target.value);
    setMetadata({});
  };

  const handleParameterChange = (id: string, value: string) => {
    setMetadata(prevMetadata => ({ ...prevMetadata, [id]: value }));
  };

  const handleStepHover = (step: string | null) => {
    setHighlightedStep(step);
  };

  const handleDownload = () => {
    const jsonString = JSON.stringify(metadata, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'proteomics_metadata.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Proteomics Metadata Organizer</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Workflow
        </label>
        <select
          value={selectedWorkflow}
          onChange={handleWorkflowChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          {WORKFLOWS.map((workflow) => (
            <option key={workflow.id} value={workflow.id}>
              {workflow.name}
            </option>
          ))}
        </select>
      </div>

      <WorkflowDiagram 
        workflowSteps={workflowSteps} 
        highlightedStep={highlightedStep}
        onStepHover={handleStepHover}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {parameters.map((parameter) => (
          <ParameterInput
            key={parameter.id}
            parameter={parameter}
            value={metadata[parameter.id] || ''}
            onChange={handleParameterChange}
            isHighlighted={highlightedStep === parameter.step}
          />
        ))}
      </div>

      <button
        onClick={handleDownload}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
      >
        <Download className="mr-2" />
        Download Metadata
      </button>
    </div>
  );
};

export default ProteomicsMetadataOrganizer;