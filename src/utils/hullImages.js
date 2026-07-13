/**
 * hullImages.js
 *
 * Central map from hull name → imported PNG.
 * Used by mission-view effectiveRoster to show the correct boat image
 * when a non-default hull has been assigned to a role slot.
 */

import imgSubSeaSail from '../assets/images/SubSeaSail.png';
import imgM48        from '../assets/images/M48.png';
import imgMariner    from '../assets/images/Mariner.png';
import imgMetalShark from '../assets/images/MetalShark.png';
import imgOtterX     from '../assets/images/OtterX.png';
import imgSaildrone  from '../assets/images/SaildroneUSV.png';
import imgFreedomAUV from '../assets/images/FreedomAUV.png';
import imgAEGIR_F    from '../assets/images/AEGIR-F.png';
import imgAEGIR_W    from '../assets/images/AEGIR-W.png';
import imgAEGIR_H    from '../assets/images/AEGIR-H.png';
import imgSeaJeep    from '../assets/images/SeaJeep.png';
import imgGARC       from '../assets/images/GARC.png';
import imgZeroUSV    from '../assets/images/ZeroUSV-Oceanus17.png';
import imgMQ4C       from '../assets/images/MQ4C Triton.png';
import imgOceanAeroTriton from '../assets/images/OceanAeroTriton.png';
import imgMQ8C       from '../assets/images/MQ8C Fire.png';
import imgMQ25       from '../assets/images/MQ25 Stingray.png';
import imgVATN       from '../assets/images/VATN_New.png';

/** Map hull `name` (from vesselHullData) → imported PNG URL */
export const HULL_IMAGES = {
  'SubSeaSail Horus':   imgSubSeaSail,
  'M48':                imgM48,
  'Mariner':            imgMariner,
  'MetalShark':         imgMetalShark,
  'Otter X':            imgOtterX,
  'Saildrone Surveyor': imgSaildrone,
  'Saildrone Voyager':  imgSaildrone,
  'Saildrone Explorer': imgSaildrone,
  'Saildrone Spectre':  imgSaildrone,
  'Freedom AUV':        imgFreedomAUV,
  'AEGIR-F':            imgAEGIR_F,
  'AEGIR-W':            imgAEGIR_W,
  'AEGIR-H':            imgAEGIR_H,
  'SeaJeep':            imgSeaJeep,
  'GP-USV Sea Jeep':    imgSeaJeep,
  'GARC':               imgGARC,
  'ZeroUSV Oceanus17':  imgZeroUSV,
  // Ocean Aero "Triton" is a small sail/solar surface-subsurface USV — NOT the MQ-4C
  // aircraft. Uses its own Ocean Aero Triton image so it renders correctly in swap lists.
  'Triton':             imgOceanAeroTriton,
  'MQ-4C Triton':       imgMQ4C,
  'MQ-8C Fire Scout':   imgMQ8C,
  'MQ-25 Stingray':     imgMQ25,
  'VATN S6':            imgVATN,
};
