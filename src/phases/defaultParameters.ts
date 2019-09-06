var log = require("loglevel").getLogger("phases-log");

const baseParameters = {
  numOfSegments: 4,
  x: 0,
  y: 0,
  width: 1000,
  height: 700,
  centerX: 200,
  centerY: 100,
  rotate: 45
};

const startGroupsParameters = [
  {
    incircle: true,
    radius: 8,
    round: 1,
    adaptArms: true,
    smartRound: true
  },
  {
    incircle: true,
    type: "radial",
    radius: 8,
    round: 1,
    adaptArms: true,
    smartRound: true
  }
];

const endGroupsParameters = [
  {
    incircle: false,
    distance: 1,
    round: 0,
    adaptArms: true
  },
  {
    incircle: false,
    type: "linear",
    distance: 1,
    round: 1,
    adaptArms: false
  }
];

///////////////
// Phase one //
///////////////

var progressionsPhaseScope = (params: any): number[] => {
  let numOfVertexes = params.endPath.vertexes.length;
  let progressions: number[] = Array(numOfVertexes);
  progressions.fill(1, 0, numOfVertexes);
  return progressions;
};

var progressionsGeneralScope = (params: any): number[] => {
  let numOfVertexes = params.endPath.vertexes.length;
  let progressions: number[] = Array(numOfVertexes);
  progressions.fill(params.duration, 0, numOfVertexes);
  return progressions;
};

const phaseOne = {
  duration: 0.1,
  progressionsPhaseScope,
  progressionsGeneralScope,
  groupsParameters: [
    {
      incircle: () => true,
      type: () => "radial",
      radius: () => 30,
      round: () => 1,
      adaptArms: () => true,
      smartRound: () => true
    },
    {
      incircle: () => true,
      type: () => "linear",
      radius: () => 30,
      round: () => 1,
      adaptArms: () => true,
      smartRound: () => true
    }
  ]
};

var progressionsPhaseScope = (params: any): number[] => {
  let progressions: number[] = [];
  const { endPath, duration } = params;
  params.endPath.vertexes.forEach((vertex: any, index: any) => {
    let maxLength = endPath.parameters.maxLength;
    let delta = maxLength / vertex.length;
    progressions.push(1 / delta);
  });
  return progressions;
};

var progressionsGeneralScope = (params: any): number[] => {
  const { duration, endPath, prevPhaseProgressions } = params;
  let progressions: number[] = [];
  params.endPath.vertexes.forEach((vertex: any, index: any) => {
    let maxLength = endPath.parameters.maxLength;
    let delta = maxLength / vertex.length;
    progressions.push(duration / delta + prevPhaseProgressions[index]);
  });
  return progressions;
};

var radiusFirstGroup = ({
  progression,
  endPath,
  vertex,
  progressionsGeneralScope,
  progressionsPhaseScope,
  activePhaseIndex,
  phasesDuration
}: any): number => {
  let maxLength = endPath.parameters.maxLength;
  let factor =
    (progression / progressionsGeneralScope[activePhaseIndex][vertex.index]) *
    progressionsPhaseScope[activePhaseIndex][vertex.index];
  let result = factor * maxLength;
  return result;
};

var radiusSecondGroup = ({
  progression,
  endPath,
  vertex,
  progressionsGeneralScope,
  progressionsPhaseScope,
  activePhaseIndex,
  phasesDuration
}: any): number => {
  let maxLength = endPath.parameters.maxLength;
  let factor =
    (progression / progressionsGeneralScope[activePhaseIndex][vertex.index]) *
    progressionsPhaseScope[activePhaseIndex][vertex.index];
  let result = factor * maxLength;
  return result / 2;
};

const phaseTwo = {
  duration: 0.5,
  progressionsPhaseScope,
  progressionsGeneralScope,
  groupsParameters: [
    {
      incircle: () => false,
      type: () => "radial",
      radius: radiusFirstGroup,
      round: () => 1
    },
    {
      incircle: () => false,
      type: () => "linear",
      radius: radiusSecondGroup,
      round: () => 1
    }
  ]
};

var progressionsPhaseScope = (params: any): number[] => {
  let progressions: number[] = [];
  const { endPath, duration } = params;
  params.endPath.vertexes.forEach((vertex: any, index: any) => {
    let maxLength = endPath.parameters.maxLength;
    let delta = maxLength / vertex.length;
    progressions.push(1 / delta);
  });
  return progressions;
};

var roundFirstGroup = ({
  progression,
  endPath,
  vertex,
  progressionsGeneralScope,
  progressionsPhaseScope,
  activePhaseIndex
}: any): number => {
  let factor =
    progression / progressionsGeneralScope[activePhaseIndex][vertex.index];
  let result = 1 - factor;
  log.debug("progression", progression);
  log.debug(
    "vertex",
    vertex.index,
    "group",
    vertex.group,
    "factor",
    factor,
    "round",
    result,
    "active phase",
    activePhaseIndex
  );
  return result;
};

var radiusSecondGroup = ({
  progression,
  endPath,
  vertex,
  progressionsGeneralScope,
  progressionsPhaseScope,
  activePhaseIndex
}: any): number => {
  let maxLength = endPath.parameters.maxLength;
  let factor =
    (progression / progressionsGeneralScope[activePhaseIndex][vertex.index]) *
    progressionsPhaseScope[activePhaseIndex][vertex.index];
  let result = factor * maxLength;
  return result;
};

const phaseThree = {
  duration: 0.4,
  progressionsPhaseScope,
  progressionsGeneralScope,
  groupsParameters: [
    {
      incircle: () => false,
      type: () => "radial",
      radius: ({ vertex }: any) => vertex.length,
      round: roundFirstGroup
    },
    {
      incircle: () => false,
      type: () => "linear",
      radius: radiusSecondGroup,
      round: () => 1
    }
  ]
};

export default {
  loop: true,
  startGroupsParameters,
  endGroupsParameters,
  baseParameters,
  phases: [{ ...phaseOne }, { ...phaseTwo }, { ...phaseThree }]
};
